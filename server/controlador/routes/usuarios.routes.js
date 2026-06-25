import { Router } from "express";

import { getUsuarios, putUsuarioRol } from "../controllers/usuarios.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { validateIdParam, validateUsuarioRol } from "../middleware/validators.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  getUsuarios
);

router.put("/:id/rol", requireAuth, requireRole("admin"), validateIdParam, validateUsuarioRol, putUsuarioRol);

export default router;
