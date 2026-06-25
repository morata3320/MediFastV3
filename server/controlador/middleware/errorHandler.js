export function notFound(req, res, _next) {
  return res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
}

export function errorHandler(err, req, res, _next) {
  console.error("Error interno:", err.message);

  const isDev = process.env.NODE_ENV === "development";

  return res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
    detail: isDev ? err.message : undefined
  });
}
