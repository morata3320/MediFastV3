export function notFound(req, res, _next) {
  return res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
}

export function errorHandler(err, req, res, _next) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    status: 500,
    message: err.message || "Error interno del servidor"
  }));

  const isDev = process.env.NODE_ENV === "development";

  return res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
    detail: isDev ? err.message : undefined
  });
}
