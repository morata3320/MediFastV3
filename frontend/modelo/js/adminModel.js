import { getToken } from "./authModel.js";

const PRODUCTOS_URL = "http://localhost:3000/api/productos";
const PEDIDOS_URL = "http://localhost:3000/api/pedidos";
const USUARIOS_URL = "http://localhost:3000/api/usuarios";

function authHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

async function manejarRespuesta(res) {
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Error en la solicitud.");
  }

  return json.data;
}

export async function obtenerProductosAdmin() {
  const res = await fetch(PRODUCTOS_URL);
  return await manejarRespuesta(res);
}

export async function crearProductoAdmin(producto) {
  const res = await fetch(PRODUCTOS_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(producto)
  });

  return await manejarRespuesta(res);
}

export async function actualizarProductoAdmin(id, producto) {
  const res = await fetch(`${PRODUCTOS_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(producto)
  });

  return await manejarRespuesta(res);
}

export async function eliminarProductoAdmin(id) {
  const res = await fetch(`${PRODUCTOS_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  return await manejarRespuesta(res);
}

export async function obtenerPedidosAdmin() {
  const res = await fetch(PEDIDOS_URL, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  return await manejarRespuesta(res);
}

export async function obtenerUsuariosAdmin() {
  const res = await fetch(USUARIOS_URL, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  return await manejarRespuesta(res);
}