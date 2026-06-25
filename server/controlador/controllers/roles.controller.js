import { prisma } from "../../modelo/js/prismaClient.js";
import { success } from "../../vista/respuestas.js";

export async function getRoles(req, res, next) {
  try {
    const roles = await prisma.rol.findMany({ orderBy: { id: "asc" } });
    return success(res, roles, "Roles obtenidos correctamente");
  } catch (error) { next(error); }
}
