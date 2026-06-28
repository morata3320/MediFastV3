import express from "express";
import dotenv from "dotenv";

import authRouter from "./routes/auth.routes.js";
import productosRouter from "./routes/productos.routes.js";
import categoriasRouter from "./routes/categorias.routes.js";
import pedidosRouter from "./routes/pedidos.routes.js";
import usuariosRouter from "./routes/usuarios.routes.js";
import rolesRouter from "./routes/roles.routes.js";

import { corsMiddleware } from "./middleware/cors.js";
import { helmetMiddleware, apiLimiter } from "./middleware/security.js";
import { logger } from "./middleware/logger.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { success } from "../vista/respuestas.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

app.use(corsMiddleware());
app.use(express.json());
app.use(helmetMiddleware);
app.use(apiLimiter);
app.use(logger);

app.get("/", (req, res) => {
  return success(res, {
    app: "MediFast API",
    version: "1.0.0",
    architecture: "MVC",
    status: "online"
  }, "Backend MediFast funcionando correctamente");
});

app.get("/api/health", (req, res) => {
  return success(res, {
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }, "API activa");
});

app.use("/api/auth", authRouter);
app.use("/api/productos", productosRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/pedidos", pedidosRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/roles", rolesRouter);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`API MediFast activa en http://localhost:${PORT}`);
  });
}

export default app;
