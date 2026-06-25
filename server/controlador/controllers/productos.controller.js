import {
  findAllProductos,
  findProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from "../../modelo/js/producto.model.js";

import { success, created, fail } from "../../vista/respuestas.js";

export async function getProductos(req, res, next) {
  try {
    const productos = await findAllProductos();

    return success(
      res,
      productos,
      "Productos obtenidos correctamente"
    );
  } catch (error) {
    next(error);
  }
}

export async function getProductoById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 0) {
      return fail(res, "ID de producto invalido", 400);
    }

    const producto = await findProductoById(id);

    if (!producto) {
      return fail(res, "Producto no encontrado", 404);
    }

    return success(
      res,
      producto,
      "Producto obtenido correctamente"
    );
  } catch (error) {
    next(error);
  }
}

export async function postProducto(req, res, next) {
  try {
    const {
      nombre,
      categoria,
      precio,
      descripcion,
      stock
    } = req.body || {};

    if (!nombre || !categoria || precio === undefined || !descripcion || stock === undefined) {
      return fail(res, "Datos incompletos para crear producto", 400);
    }

    const nuevoProducto = await createProducto(req.body);

    return created(
      res,
      nuevoProducto,
      "Producto creado correctamente"
    );
  } catch (error) {
    next(error);
  }
}

export async function putProducto(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 0) {
      return fail(res, "ID de producto invalido", 400);
    }

    const actualizado = await updateProducto(id, req.body || {});

    if (!actualizado) {
      return fail(res, "Producto no encontrado", 404);
    }

    return success(
      res,
      actualizado,
      "Producto actualizado correctamente"
    );
  } catch (error) {
    next(error);
  }
}

export async function removeProducto(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 0) {
      return fail(res, "ID de producto invalido", 400);
    }

    const eliminado = await deleteProducto(id);

    if (!eliminado) {
      return fail(res, "Producto no encontrado", 404);
    }

    return success(
      res,
      { id },
      "Producto eliminado correctamente"
    );
  } catch (error) {
    next(error);
  }
}