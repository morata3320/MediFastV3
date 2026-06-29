import { describe, expect, jest, test } from "@jest/globals";

const tx = {
  producto: {
    findMany: jest.fn(),
    updateMany: jest.fn()
  },
  tipoMovimientoInventario: { findUnique: jest.fn() },
  estadoPedido: { findUnique: jest.fn() },
  metodoPago: { findUnique: jest.fn() },
  usuario: { findUnique: jest.fn(), findFirst: jest.fn() },
  cliente: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn() },
  direccionCliente: { create: jest.fn() },
  pedido: { create: jest.fn(), findUnique: jest.fn() },
  movimientoInventario: { create: jest.fn() },
  pago: { create: jest.fn() }
};

const transaction = jest.fn((callback) => callback(tx));

jest.unstable_mockModule("../modelo/js/prismaClient.js", () => ({
  prisma: { $transaction: transaction }
}));

const { createPedido } = await import("../modelo/js/pedido.model.js");

function prepararTransaccion() {
  jest.clearAllMocks();
  tx.producto.findMany.mockResolvedValue([{ id: 5, nombre: "Producto", precioVenta: 10, stockActual: 4 }]);
  tx.tipoMovimientoInventario.findUnique.mockResolvedValue({ id: 3, nombre: "SALIDA_VENTA" });
  tx.estadoPedido.findUnique.mockResolvedValue({ id: 1, nombre: "Pendiente" });
  tx.metodoPago.findUnique.mockResolvedValue({ id: 2, nombre: "Tarjeta" });
  tx.usuario.findUnique.mockResolvedValue({ id: 2, email: "user@example.com", cliente: null });
  tx.usuario.findFirst.mockResolvedValue(null);
  tx.cliente.findUnique.mockResolvedValue(null);
  tx.cliente.findFirst.mockResolvedValue(null);
  tx.cliente.create.mockResolvedValue({ id: 8 });
  tx.direccionCliente.create.mockResolvedValue({ id: 9 });
  tx.pedido.create.mockResolvedValue({ id: 20 });
  tx.producto.updateMany.mockResolvedValue({ count: 1 });
  tx.pedido.findUnique.mockResolvedValue({ id: 20, pagos: [{ tarjetaUltimos4: "1111" }] });
}

describe("createPedido", () => {
  test("crea detalle, pago y movimiento de inventario en una transaccion", async () => {
    prepararTransaccion();

    const pedido = await createPedido(
      2,
      [{ productoId: 5, cantidad: 2 }],
      { metodo: "Tarjeta", tarjeta: "4111111111111111" },
      {
        cliente: { nombres: "Ana Perez", apellidos: "Perez", cedula: "1234567890", telefono: "0991234567", email: "ana@example.com" },
        direccion: { ciudad: "Quito", direccion: "Av. Principal 123", referencia: "Casa azul" }
      }
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(tx.pedido.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ clienteId: 8, direccionClienteId: 9, total: 22.5 })
    }));
    expect(tx.movimientoInventario.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ productoId: 5, cantidad: 2, stockAnterior: 4, stockNuevo: 2, motivo: "Salida por venta", referencia: "Pedido #20" })
    }));
    expect(tx.pago.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ pedidoId: 20, metodoPagoId: 2, tarjetaUltimos4: "1111" })
    }));
    expect(pedido.id).toBe(20);
  });

  test("rechaza stock insuficiente antes de descontar inventario", async () => {
    prepararTransaccion();
    tx.producto.findMany.mockResolvedValue([{ id: 5, nombre: "Producto", precioVenta: 10, stockActual: 1 }]);

    await expect(createPedido(2, [{ productoId: 5, cantidad: 2 }], { metodo: "Efectivo" })).rejects.toThrow("Stock insuficiente");
    expect(tx.producto.updateMany).not.toHaveBeenCalled();
  });

  test("checkout repetido del mismo usuario reutiliza cliente sin conflicto", async () => {
    prepararTransaccion();
    tx.usuario.findUnique.mockResolvedValue({
      id: 2,
      email: "user@example.com",
      cliente: { id: 8, usuarioId: 2, cedula: "1234567890", email: "user@example.com" }
    });
    tx.cliente.findUnique.mockResolvedValue({ id: 8, usuarioId: 2, cedula: "1234567890", email: "user@example.com" });
    tx.cliente.update.mockResolvedValue({ id: 8, usuarioId: 2 });

    await createPedido(
      2,
      [{ productoId: 5, cantidad: 1 }],
      { metodo: "Efectivo" },
      {
        cliente: { nombres: "Ana Perez", apellidos: "Perez", cedula: "1234567890", telefono: "0991234567", email: "user@example.com" },
        direccion: { ciudad: "Quito", direccion: "Av. Principal 123" }
      }
    );

    expect(tx.cliente.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 8 },
      data: expect.objectContaining({ email: "user@example.com", cedula: "1234567890" })
    }));
  });

  test("checkout enlaza cliente sin usuarioId cuando coincide con correo del usuario autenticado", async () => {
    prepararTransaccion();
    tx.usuario.findUnique.mockResolvedValue({ id: 2, email: "user@example.com", username: "user", cliente: null });
    tx.cliente.findUnique.mockResolvedValue({ id: 8, usuarioId: null, cedula: "1234567890", email: "user@example.com" });
    tx.cliente.update.mockResolvedValue({ id: 8, usuarioId: 2 });

    await createPedido(
      2,
      [{ productoId: 5, cantidad: 1 }],
      { metodo: "Tarjeta", tarjeta: "4111111111111111" },
      {
        cliente: { nombres: "Ana Perez", apellidos: "Perez", cedula: "123-456-7890", telefono: "099 123 4567", email: " USER@example.com " },
        direccion: { ciudad: "Quito", direccion: "Av. Principal 123" }
      }
    );

    expect(tx.cliente.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 8 },
      data: expect.objectContaining({
        usuarioId: 2,
        cedula: "1234567890",
        telefono: "0991234567",
        email: "user@example.com"
      })
    }));
    expect(tx.pago.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tarjetaUltimos4: "1111" })
    }));
  });

  test("checkout con correo de otro usuario devuelve conflicto limpio", async () => {
    prepararTransaccion();
    tx.usuario.findFirst.mockResolvedValue({ id: 7, email: "otro@example.com" });

    await expect(createPedido(
      2,
      [{ productoId: 5, cantidad: 1 }],
      { metodo: "Transferencia", comprobante: "TRX-001" },
      {
        cliente: { nombres: "Ana Perez", apellidos: "Perez", cedula: "1234567890", telefono: "0991234567", email: "otro@example.com" },
        direccion: { ciudad: "Quito", direccion: "Av. Principal 123" }
      }
    )).rejects.toMatchObject({
      status: 409,
    });
  });

  test("checkout con cedula de otro cliente devuelve conflicto limpio", async () => {
    prepararTransaccion();
    tx.cliente.findUnique.mockResolvedValue({ id: 99, usuarioId: 7, cedula: "1234567890", email: "otro@example.com" });

    await expect(createPedido(
      2,
      [{ productoId: 5, cantidad: 1 }],
      { metodo: "Efectivo" },
      {
        cliente: { nombres: "Ana Perez", apellidos: "Perez", cedula: "1234567890", telefono: "0991234567", email: "user@example.com" },
        direccion: { ciudad: "Quito", direccion: "Av. Principal 123" }
      }
    )).rejects.toMatchObject({
      status: 409,
    });
  });
});
