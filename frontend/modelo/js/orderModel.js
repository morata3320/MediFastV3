import { getToken } from "./authModel.js";

const API_URL = "http://localhost:3000/api/pedidos";

export async function crearPedido(items) {
  const token = getToken();

  if (!token) {
    throw new Error("Debes iniciar sesion para confirmar el pedido.");
  }

  const payload = {
    items: items.map((item) => ({
      productoId: item.id,
      cantidad: item.cantidad
    }))
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "No se pudo registrar el pedido.");
  }

  return json.data;
}

export async function obtenerMisPedidos() {
  const token = getToken();

  const res = await fetch(`${API_URL}/mis-pedidos`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "No se pudieron cargar tus pedidos.");
  }

  return json.data;
}

export async function obtenerTodosLosPedidos() {
  const token = getToken();

  const res = await fetch(API_URL, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "No se pudieron cargar los pedidos.");
  }

  return json.data;
}