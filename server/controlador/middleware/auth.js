import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        status: "error",
        message: "Token requerido",
        errors: null
      });
    }

    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({
      status: "error",
      message: "Token invalido o expirado",
      errors: null
    });
  }
}