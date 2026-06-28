import { findActiveCategorias } from "../../modelo/js/categoria.model.js";
import { success } from "../../vista/respuestas.js";

export async function getCategorias(req, res, next) {
  try {
    const categorias = await findActiveCategorias();
    return success(res, categorias, "Categorias obtenidas correctamente");
  } catch (error) {
    next(error);
  }
}
