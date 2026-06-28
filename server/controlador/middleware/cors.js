import cors from "cors";

function normalizeOrigin(origin) {
  return String(origin || "").trim().replace(/\/$/, "");
}

export function corsMiddleware() {
  const configuredOrigins = (process.env.CORS_ORIGIN || "https://medi-fast-v3.vercel.app")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);
  const allowedOrigins = new Set(configuredOrigins);

  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      return callback(new Error("CORS: origen no permitido"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: process.env.CORS_CREDENTIALS === "true",
    optionsSuccessStatus: 204
  });
}
