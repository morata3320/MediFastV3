const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_BASE = API_ORIGIN.replace(/\/$/, "").endsWith("/api")
  ? API_ORIGIN.replace(/\/$/, "")
  : `${API_ORIGIN.replace(/\/$/, "")}/api`;

const TOKEN_KEY = "mf_token";
const USER_KEY = "mf_user";

export class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function logoutSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const requestHeaders = { Accept: "application/json", ...headers };
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";

  const token = getToken();
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Verifique que la API esté activa.", 0);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const messages = {
      400: "Revise los datos enviados.",
      401: "Su sesión no es válida. Inicie sesión nuevamente.",
      403: "No tiene permisos para esta acción.",
      500: "El servidor no pudo completar la solicitud."
    };
    throw new ApiError(payload.message || messages[response.status] || "No se pudo completar la solicitud.", response.status, payload.errors);
  }

  return payload.data;
}

export async function login(identifier, password) {
  const data = await request("/auth/login", { method: "POST", body: { identifier, password } });
  saveSession(data);
  return data.user;
}

export async function register(username, email, password) {
  const data = await request("/auth/register", { method: "POST", body: { username, email, password } });
  saveSession(data);
  return data.user;
}

export const productosApi = {
  listar: () => request("/productos"),
  crear: (producto) => request("/productos", { method: "POST", body: producto }),
  actualizar: (id, producto) => request(`/productos/${id}`, { method: "PUT", body: producto }),
  eliminar: (id) => request(`/productos/${id}`, { method: "DELETE" })
};

export const pedidosApi = {
  crear: (items, pago, cliente, direccion) => request("/pedidos", { method: "POST", body: { items, pago, cliente, direccion } }),
  misPedidos: () => request("/pedidos/mis-pedidos"),
  todos: () => request("/pedidos"),
  actualizarEstado: (id, estado) => request(`/pedidos/${id}/estado`, { method: "PATCH", body: { estado } })
};

export const usuariosApi = {
  listar: () => request("/usuarios"),
  actualizarRol: (id, rolId) => request(`/usuarios/${id}/rol`, { method: "PUT", body: { rolId } })
};

export const rolesApi = { listar: () => request("/roles") };
