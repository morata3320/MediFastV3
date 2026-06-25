import {
  createPedido,
  findPedidosByUser,
  findAllPedidos
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
