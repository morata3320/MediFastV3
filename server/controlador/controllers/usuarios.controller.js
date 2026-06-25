import { findAllUsuarios, updateUsuarioRol } from "../../modelo/js/usuario.model.js";
import { success, fail } from "../../vista/respuestas.js";

export async function getUsuarios(req, res, next) {
  try {
    const usuarios = await findAllUsuarios();

    return success(
      res,
      usuarios,
      "Usuarios obtenidos correctamente"
    );
  } catch (error) {
    next(error);
  }
}

export async function putUsuarioRol(req, res, next) {
  try {
    const usuario = await updateUsuarioRol(req.params.id, req.body.rolId);
    return success(res, usuario, "Rol de usuario actualizado correctamente");
  } catch (error) {
    if (error.code === "P2025") return fail(res, "Usuario o rol no encontrado", 404);
    next(error);
  }
}
