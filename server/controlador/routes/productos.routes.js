import { Router } from "express";

import {
  getProductos,
  getProductoById,
  postProducto,
  putProducto,
  removeProducto
} from "../controllers/productos.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

import {
  validateIdParam,
  validateProductoCreate,
  validateProductoUpdate
} from "../middleware/validators.js";

const router = Router();

router.get("/", getProductos);
router.get("/:id", validateIdParam, getProductoById);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validateProductoCreate,
  postProducto
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateIdParam,
  validateProductoUpdate,
  putProducto
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateIdParam,
  removeProducto
);

export default router;