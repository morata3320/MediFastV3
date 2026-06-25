import fs from "fs";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const productosPath = new URL("../data/productos.json", import.meta.url);
const leerProductosJson = () => JSON.parse(fs.readFileSync(productosPath, "utf8").replace(/^\uFEFF/, "").trim());

async function catalogos() {
  for (const [nombre, descripcion] of [["admin", "Administrador del sistema"], ["user", "Cliente de la farmacia"]])
    await prisma.rol.upsert({ where: { nombre }, update: { descripcion }, create: { nombre, descripcion } });
  for (const nombre of ["Medicamentos", "Cuidado personal", "Vitaminas", "Dispositivos medicos", "General"])
    await prisma.categoria.upsert({ where: { nombre }, update: {}, create: { nombre } });
  await prisma.unidadMedida.upsert({ where: { abreviatura: "Und" }, update: {}, create: { nombre: "Unidad", abreviatura: "Und" } });
  for (const nombre of ["Efectivo", "Tarjeta", "Transferencia"])
    await prisma.metodoPago.upsert({ where: { nombre }, update: {}, create: { nombre } });
  for (const nombre of ["Pendiente", "Pagado", "En preparación", "Enviado", "Entregado", "Cancelado"])
    await prisma.estadoPedido.upsert({ where: { nombre }, update: {}, create: { nombre } });
  for (const nombre of ["ENTRADA_COMPRA", "SALIDA_VENTA", "AJUSTE_POSITIVO", "AJUSTE_NEGATIVO"])
    await prisma.tipoMovimientoInventario.upsert({ where: { nombre }, update: {}, create: { nombre } });
  await prisma.proveedor.upsert({ where: { rucCedula: "0999999999001" }, update: {}, create: { nombre: "Proveedor MediFast", rucCedula: "0999999999001", activo: true } });
}

async function usuarios() {
  const admin = await prisma.rol.findUniqueOrThrow({ where: { nombre: "admin" } });
  const user = await prisma.rol.findUniqueOrThrow({ where: { nombre: "user" } });
  for (const datos of [
    { username: "admin", email: "admin@medifast.com", password: "Admin123!", rolId: admin.id },
    { username: "user", email: "user@medifast.com", password: "User123!", rolId: user.id }
  ]) {
    await prisma.usuario.upsert({ where: { email: datos.email }, update: { username: datos.username, passwordHash: await bcrypt.hash(datos.password, 10), rolId: datos.rolId, activo: true }, create: { username: datos.username, email: datos.email, passwordHash: await bcrypt.hash(datos.password, 10), rolId: datos.rolId } });
  }
}

async function productos() {
  const unidad = await prisma.unidadMedida.findUniqueOrThrow({ where: { abreviatura: "Und" } });
  for (const p of leerProductosJson()) {
    const categoria = await prisma.categoria.upsert({ where: { nombre: p.categoria || "General" }, update: {}, create: { nombre: p.categoria || "General" } });
    const existente = await prisma.producto.findFirst({ where: { nombre: p.nombre } });
    const data = { categoriaId: categoria.id, unidadMedidaId: unidad.id, nombre: p.nombre, descripcion: p.descripcion, precioVenta: Number(p.precio), precioCompra: 0, stockActual: Number(p.stock), stockMinimo: 5, imagen: p.imagen || "assets/placeholder.svg", requiereReceta: Boolean(p.requiereReceta), laboratorio: p.laboratorio || "", principioActivo: p.principioActivo || null, oferta: Boolean(p.oferta), activo: true };
    if (existente) await prisma.producto.update({ where: { id: existente.id }, data }); else await prisma.producto.create({ data });
  }
}

async function main() {
  await catalogos(); await usuarios(); await productos();
  console.log("Seed completado: catalogos, usuarios y productos iniciales.");
}
main().catch((error) => { console.error("Error ejecutando seed:", error); process.exit(1); }).finally(() => prisma.$disconnect());
