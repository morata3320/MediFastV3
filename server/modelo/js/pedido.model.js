import { prisma } from "./prismaClient.js";

function normalizarItems(items) {
  const agrupados = new Map();
  for (const item of items) {
    const productoId = Number(item.productoId ?? item.id);
    const cantidad = Number(item.cantidad ?? item.qty ?? 1);
    agrupados.set(productoId, (agrupados.get(productoId) || 0) + cantidad);
  }
  return [...agrupados].map(([productoId, cantidad]) => ({ productoId, cantidad }));
}

const pedidoInclude = {
  usuario: { select: { id: true, username: true, email: true, rol: { select: { nombre: true } } } },
  cliente: { select: { id: true, nombres: true, apellidos: true, cedula: true, telefono: true, email: true } },
  direccionCliente: { select: { id: true, ciudad: true, direccion: true, referencia: true } },
  estadoPedido: true,
  detalles: { include: { producto: { include: { categoria: true, unidadMedida: true } } } },
  pagos: { include: { metodoPago: true } }
};

export class PedidoConflictError extends Error {
  constructor(message = "Ese correo o cédula ya está registrado en otra cuenta.") {
    super(message);
    this.name = "PedidoConflictError";
    this.status = 409;
  }
}

function normalizarCorreo(email) {
  return String(email || "").trim().toLowerCase();
}

function esErrorUnicoPrisma(error) {
  return error?.code === "P2002" || /Unique constraint failed|dbo\.Cliente/i.test(String(error?.message || ""));
}

async function validarConflictosCliente(tx, userId, clienteActual, datosCliente) {
  const usuarioId = Number(userId);

  if (datosCliente.cedula) {
    const clienteConCedula = await tx.cliente.findUnique({ where: { cedula: datosCliente.cedula } });
    if (clienteConCedula && clienteConCedula.usuarioId !== usuarioId && clienteConCedula.id !== clienteActual?.id) {
      throw new PedidoConflictError();
    }
  }

  if (datosCliente.email) {
    const correo = normalizarCorreo(datosCliente.email);
    const otroUsuario = await tx.usuario.findFirst({ where: { email: correo, id: { not: usuarioId } } });
    if (otroUsuario) throw new PedidoConflictError();

    const otroCliente = await tx.cliente.findFirst({
      where: {
        email: correo,
        usuarioId: { not: usuarioId }
      }
    });
    if (otroCliente && otroCliente.id !== clienteActual?.id) throw new PedidoConflictError();
  }

  return true;
}

async function guardarDatosCliente(tx, userId, cliente, direccion) {
  if (!cliente && !direccion) return { clienteId: null, direccionClienteId: null };

  const usuario = await tx.usuario.findUnique({ where: { id: Number(userId) }, include: { cliente: true } });
  if (!usuario) throw new Error("Usuario no encontrado.");

  let clienteRegistrado = usuario.cliente;
  if (cliente) {
    const datosCliente = {
      nombres: cliente.nombres,
      apellidos: cliente.apellidos || "No especificado",
      cedula: cliente.cedula || null,
      telefono: cliente.telefono || null,
      email: normalizarCorreo(cliente.email || usuario.email)
    };
    await validarConflictosCliente(tx, userId, clienteRegistrado, datosCliente);
    clienteRegistrado = clienteRegistrado
      ? await tx.cliente.update({ where: { id: clienteRegistrado.id }, data: datosCliente })
      : await tx.cliente.create({ data: { ...datosCliente, usuarioId: Number(userId) } });
  }

  if (direccion && !clienteRegistrado) throw new Error("Los datos del cliente son obligatorios para guardar una direccion.");
  const direccionRegistrada = direccion
    ? await tx.direccionCliente.create({ data: { clienteId: clienteRegistrado.id, ciudad: direccion.ciudad, direccion: direccion.direccion, referencia: direccion.referencia || null } })
    : null;

  return { clienteId: clienteRegistrado?.id || null, direccionClienteId: direccionRegistrada?.id || null };
}

async function resolverMetodoPago(tx, pago) {
  const nombresNormalizados = {
    efectivo: "Efectivo",
    tarjeta: "Tarjeta",
    transferencia: "Transferencia"
  };
  const nombre = nombresNormalizados[String(pago?.metodo || "").toLowerCase()] || pago?.metodo;
  const metodo = pago?.metodoPagoId
    ? await tx.metodoPago.findUnique({ where: { id: Number(pago.metodoPagoId) } })
    : await tx.metodoPago.findUnique({ where: { nombre } });
  if (!metodo) throw new Error("Metodo de pago invalido.");
  return metodo;
}

export async function createPedido(userId, items, pago = {}, datosCheckout = {}) {
  const normalizados = normalizarItems(items);
  if (!normalizados.length) throw new Error("El pedido no contiene productos.");

  try {
    return await prisma.$transaction(async (tx) => {
    const productos = await tx.producto.findMany({ where: { id: { in: normalizados.map((i) => i.productoId) }, activo: true } });
    if (productos.length !== normalizados.length) throw new Error("Uno o mas productos no existen o no estan disponibles.");
    const tipoSalida = await tx.tipoMovimientoInventario.findUnique({ where: { nombre: "SALIDA_VENTA" } });
    const estadoPendiente = await tx.estadoPedido.findUnique({ where: { nombre: "Pendiente" } });
    const metodoPago = await resolverMetodoPago(tx, pago);
    if (!tipoSalida || !estadoPendiente) throw new Error("Catalogos de pedido no inicializados. Ejecute el seed.");

    let subtotal = 0;
    const detalles = normalizados.map((item) => {
      const producto = productos.find((p) => p.id === item.productoId);
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0.");
      if (producto.stockActual < item.cantidad) throw new Error(`Stock insuficiente para ${producto.nombre}`);
      const linea = producto.precioVenta * item.cantidad;
      subtotal += linea;
      return { productoId: producto.id, cantidad: item.cantidad, precioUnitario: producto.precioVenta, subtotal: linea };
    });
    const envio = subtotal > 0 ? 2.5 : 0;
    const datosCliente = await guardarDatosCliente(tx, userId, datosCheckout.cliente, datosCheckout.direccion);
    const pedido = await tx.pedido.create({ data: {
      usuarioId: Number(userId), estadoPedidoId: estadoPendiente.id, ...datosCliente, subtotal, envio, iva: 0, total: subtotal + envio,
      detalles: { create: detalles }
    }, include: pedidoInclude });

    for (const item of normalizados) {
      const producto = productos.find((p) => p.id === item.productoId);
      const resultado = await tx.producto.updateMany({
        where: { id: producto.id, stockActual: { gte: item.cantidad } }, data: { stockActual: { decrement: item.cantidad } }
      });
      if (resultado.count !== 1) throw new Error(`Stock insuficiente para ${producto.nombre}`);
      await tx.movimientoInventario.create({ data: {
        productoId: producto.id, tipoMovimientoId: tipoSalida.id, cantidad: item.cantidad,
        stockAnterior: producto.stockActual, stockNuevo: producto.stockActual - item.cantidad,
        motivo: "Salida por venta", referencia: `Pedido #${pedido.id}`
      }});
    }
    await tx.pago.create({ data: {
      pedidoId: pedido.id,
      metodoPagoId: metodoPago.id,
      monto: pedido.total,
      tarjetaUltimos4: pago.tarjeta ? pago.tarjeta.slice(-4) : pago.tarjetaUltimos4 || null,
      comprobante: pago.comprobante || pago.referencia || null,
      estado: pago.estado || "Pendiente"
    }});
    return tx.pedido.findUnique({ where: { id: pedido.id }, include: pedidoInclude });
    });
  } catch (error) {
    if (error instanceof PedidoConflictError) throw error;
    if (esErrorUnicoPrisma(error)) throw new PedidoConflictError();
    throw error;
  }
}
export async function findPedidosByUser(userId) {
  return prisma.pedido.findMany({ where: { usuarioId: Number(userId) }, orderBy: { createdAt: "desc" }, include: pedidoInclude });
}
export async function findAllPedidos() {
  return prisma.pedido.findMany({ orderBy: { createdAt: "desc" }, include: pedidoInclude });
}

export async function updatePedidoEstado(id, estado) {
  const pedidoId = Number(id);
  const nombreEstado = String(estado || "").trim();

  if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
    throw new Error("ID de pedido invalido.");
  }
  if (!nombreEstado) {
    throw new Error("El estado del pedido es obligatorio.");
  }

  const estadoPedido = await prisma.estadoPedido.findUnique({ where: { nombre: nombreEstado } });
  if (!estadoPedido) {
    throw new Error("Estado de pedido no valido.");
  }

  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
  if (!pedido) {
    throw new Error("Pedido no encontrado.");
  }

  return prisma.pedido.update({
    where: { id: pedidoId },
    data: { estadoPedidoId: estadoPedido.id },
    include: pedidoInclude
  });
}
