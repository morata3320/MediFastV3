import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const helmetMiddleware = helmet();

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Demasiadas solicitudes. Intenta nuevamente mas tarde."
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Demasiados intentos de autenticación. Intenta nuevamente más tarde."
  }
});
