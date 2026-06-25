import { Router } from "express";

import {
  register,
  login
} from "../controllers/auth.controller.js";

import {
  validateRegister,
  validateLogin
} from "../middleware/validators.js";
import { authLimiter } from "../middleware/security.js";

const router = Router();

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);

export default router;
