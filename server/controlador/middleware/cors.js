import cors from "cors";

export function corsMiddleware() {
  const allowedOrigin = process.env.CORS_ORIGIN || "http://127.0.0.1:5500";

  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (origin === allowedOrigin) {
        return callback(null, true);
      }

      return callback(new Error("CORS: origen no permitido"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
  });
}
