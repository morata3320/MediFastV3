import { Router } from "express";
import { getRoles } from "../controllers/roles.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();
router.get("/", requireAuth, requireRole("admin"), getRoles);
export default router;
