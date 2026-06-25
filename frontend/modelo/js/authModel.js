const API_URL = "http://localhost:3000/api/auth";

const TOKEN_KEY = "mf_token";
const USER_KEY = "mf_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function isAdmin() {
  return getCurrentUser()?.role === "admin";
}

export async function login(identifier, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ identifier, password })
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "No se pudo iniciar sesion.");
  }

  localStorage.setItem(TOKEN_KEY, json.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(json.data.user));

  return json.data.user;
}

export async function register(username, email, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password })
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "No se pudo registrar el usuario.");
  }

  localStorage.setItem(TOKEN_KEY, json.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(json.data.user));

  return json.data.user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}