import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      username: user.username,
      rol: user.role,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
