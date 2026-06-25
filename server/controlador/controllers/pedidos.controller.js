import {
  createPedido,
  findPedidosByUser,
  findAllPedidos,
  updatePedidoEstado
} from "../../modelo/js/pedido.model.js";

import { success, created, fail } from "../../vista/respuestas.js";

export async function postPedido(req, res, _next) {
  try {
    const { items, pago, cliente, direccion } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return fail(res, "El carrito enviado esta vacio", 400);
    }

    const pedido = await createPedido(req.user.id || req.user.sub, items, pago, { cliente, direccion });

    return created(
      res,
      pedido,
      "Pedido registrado correctamente"
    );
  } catch (error) {
    return fail(res, error.message || "No se pudo registrar el pedido", 400);
  }
}

export async function getMisPedidos(req, res, next) {
  try {
    const pedidos = await findPedidosByUser(req.user.sub);

    return success(
      res,
      pedidos,
      "Pedidos del usuario obtenidos correctamente"
    );
  } catch (error) {
    next(error);
  }
}

export async function getPedidos(req, res, next) {
  try {
    const pedidos = await findAllPedidos();

    return success(
      res,
      pedidos,
      "Todos los pedidos obtenidos correctamente"
    );
  } catch (error) {
    next(error);
  }
}

export async function patchPedidoEstado(req, res, _next) {
  try {
    const pedido = await updatePedidoEstado(req.params.id, req.body?.estado);

    return success(
      res,
      pedido,
      "Estado de pedido actualizado correctamente"
    );
  } catch (error) {
    const message = error.message || "No se pudo actualizar el estado del pedido";
    const status = /no encontrado/i.test(message) ? 404 : 400;
    return fail(res, message, status);
  }
}
