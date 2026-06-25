import { Router } from "express";

import {
  postPedido,
  getMisPedidos,
  getPedidos,
  patchPedidoEstado
} from "../controllers/pedidos.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { validatePedidoCreate } from "../middleware/validators.js";

const router = Router();

router.post("/", requireAuth, validatePedidoCreate, postPedido);

router.get(
  "/mis-pedidos",
  requireAuth,
  getMisPedidos
);

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  getPedidos
);

router.patch(
  "/:id/estado",
  requireAuth,
  requireRole("admin"),
  patchPedidoEstado
);

export default router;
