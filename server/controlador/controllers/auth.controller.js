import bcrypt from "bcryptjs";

import {
  findUsuarioByEmailOrUsername,
  createUsuario
} from "../../modelo/js/usuario.model.js";

import { signToken } from "../utils/jwt.js";
import { success, created, fail } from "../../vista/respuestas.js";

function usuarioSeguro(usuario) {
  return {
    id: usuario.id,
    username: usuario.username,
    email: usuario.email,
    role: usuario.rol?.nombre || usuario.role,
    createdAt: usuario.createdAt
  };
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body || {};

    const existente = await findUsuarioByEmailOrUsername(email);

    if (existente) {
      return fail(res, "El correo ya esta registrado", 409);
    }

    const usernameExistente = await findUsuarioByEmailOrUsername(username);

    if (usernameExistente) {
      return fail(res, "El nombre de usuario ya esta registrado", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await createUsuario({
      username,
      email,
      passwordHash,
      role: "user"
    });

    const token = signToken(usuarioSeguro(nuevoUsuario));

    return created(
      res,
      {
        token,
        user: usuarioSeguro(nuevoUsuario)
      },
      "Usuario registrado correctamente"
    );
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { identifier, username, email, password } = req.body || {};

    const loginId = identifier || username || email;

    const usuario = await findUsuarioByEmailOrUsername(loginId);

    if (!usuario) {
      return fail(res, "Credenciales invalidas", 401);
    }

    const passwordOk = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordOk) {
      return fail(res, "Credenciales invalidas", 401);
    }

    const token = signToken(usuarioSeguro(usuario));

    return success(
      res,
      {
        token,
        user: usuarioSeguro(usuario)
      },
      "Login correcto"
    );
  } catch (error) {
    next(error);
  }
}
