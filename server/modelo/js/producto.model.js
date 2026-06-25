import { prisma } from "./prismaClient.js";

function serializarProducto(producto) {
  if (!producto) return producto;
  const { categoria, unidadMedida, ...datos } = producto;
  return {
    ...datos,
    categoria: categoria?.nombre || "Sin categoria",
    unidad: unidadMedida?.abreviatura || "Unidad",
    precio: datos.precioVenta,
    stock: datos.stockActual
  };
}

const include = { categoria: true, unidadMedida: true };

async function referencia(nombre, abreviatura = "Und") {
  const categoria = await prisma.categoria.upsert({ where: { nombre }, update: {}, create: { nombre } });
  const unidadMedida = await prisma.unidadMedida.upsert({
    where: { abreviatura }, update: {}, create: { nombre: abreviatura === "Und" ? "Unidad" : abreviatura, abreviatura }
  });
  return { categoria, unidadMedida };
}

export async function findAllProductos() {
  const productos = await prisma.producto.findMany({ orderBy: { id: "asc" }, include, where: { activo: true } });
  return productos.map(serializarProducto);
}
export async function findProductoById(id) {
  return serializarProducto(await prisma.producto.findUnique({ where: { id: Number(id) }, include }));
}
export async function createProducto(data) {
  const { categoria, unidadMedida } = await referencia(data.categoria || "General", data.unidad || "Und");
  const producto = await prisma.producto.create({ data: {
    nombre: data.nombre, categoriaId: categoria.id, unidadMedidaId: unidadMedida.id,
    precioVenta: Number(data.precioVenta ?? data.precio), precioCompra: Number(data.precioCompra ?? 0),
    stockActual: Number(data.stockActual ?? data.stock), stockMinimo: Number(data.stockMinimo ?? 5),
    imagen: data.imagen || "assets/placeholder.svg", descripcion: data.descripcion,
    requiereReceta: Boolean(data.requiereReceta), laboratorio: data.laboratorio || "",
    principioActivo: data.principioActivo || null, oferta: Boolean(data.oferta), activo: data.activo !== false
  }, include });
  return serializarProducto(producto);
}
export async function updateProducto(id, data) {
  const existe = await prisma.producto.findUnique({ where: { id: Number(id) }, include });
  if (!existe) return null;
  const ref = data.categoria || data.unidad ? await referencia(data.categoria || existe.categoria.nombre, data.unidad || existe.unidadMedida.abreviatura) : null;
  const producto = await prisma.producto.update({ where: { id: Number(id) }, data: {
    nombre: data.nombre ?? existe.nombre, categoriaId: ref?.categoria.id ?? existe.categoriaId,
    unidadMedidaId: ref?.unidadMedida.id ?? existe.unidadMedidaId,
    precioVenta: (data.precioVenta ?? data.precio) !== undefined ? Number(data.precioVenta ?? data.precio) : existe.precioVenta,
    precioCompra: data.precioCompra !== undefined ? Number(data.precioCompra) : existe.precioCompra,
    stockActual: (data.stockActual ?? data.stock) !== undefined ? Number(data.stockActual ?? data.stock) : existe.stockActual,
    stockMinimo: data.stockMinimo !== undefined ? Number(data.stockMinimo) : existe.stockMinimo,
    imagen: data.imagen ?? existe.imagen, descripcion: data.descripcion ?? existe.descripcion,
    requiereReceta: data.requiereReceta ?? existe.requiereReceta, laboratorio: data.laboratorio ?? existe.laboratorio,
    principioActivo: data.principioActivo ?? existe.principioActivo, oferta: data.oferta ?? existe.oferta, activo: data.activo ?? existe.activo
  }, include });
  return serializarProducto(producto);
}
export async function deleteProducto(id) {
  const existe = await prisma.producto.findUnique({ where: { id: Number(id) } });
  if (!existe) return false;
  await prisma.producto.update({ where: { id: Number(id) }, data: { activo: false } });
  return true;
}
