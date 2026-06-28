import { prisma } from "./prismaClient.js";

export async function findActiveCategorias() {
  return prisma.categoria.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, descripcion: true }
  });
}
