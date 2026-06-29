export function logger(req, res, next) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    if (res.statusCode >= 400) {
      console.warn(JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        message: res.statusMessage || "HTTP error"
      }));
    }
  });

  next();
}
