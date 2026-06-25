import { prisma } from "./prismaClient.js";

const usuarioPublico = {
  id: true, username: true, email: true, activo: true, createdAt: true,
  rol: { select: { id: true, nombre: true } }
};

export function serializarUsuario(usuario) {
  if (!usuario) return usuario;
  const { rol, ...datos } = usuario;
  return { ...datos, role: rol?.nombre, rolId: rol?.id };
}

export async function findUsuarioByEmailOrUsername(identifier) {
  return prisma.usuario.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
    include: { rol: true }
  });
}

export async function findAllUsuarios() {
  const usuarios = await prisma.usuario.findMany({ orderBy: { id: "asc" }, select: usuarioPublico });
  return usuarios.map(serializarUsuario);
}

export async function createUsuario(data) {
  const rol = await prisma.rol.findUnique({ where: { nombre: data.role || "user" } });
  if (!rol) throw new Error("El rol por defecto no esta configurado.");
  return prisma.usuario.create({
    data: { username: data.username, email: data.email, passwordHash: data.passwordHash, rolId: rol.id },
    include: { rol: true }
  });
}

export async function updateUsuarioRol(id, rolId) {
  const usuario = await prisma.usuario.update({
    where: { id: Number(id) }, data: { rolId: Number(rolId) }, include: { rol: true }
  });
  return serializarUsuario(usuario);
}
