import {
  login,
  register,
  logout,
  getCurrentUser
} from "../../modelo/js/authModel.js";

import {
  authBarHTML,
  authModalHTML
} from "../../vista/js/authView.js";

import { showToast } from "../../vista/js/uiView.js";

let modoActual = "login";

function contenedorAuth() {
  let el = document.getElementById("auth-container");

  if (!el) {
    el = document.createElement("div");
    el.id = "auth-container";

    const header = document.querySelector("header") || document.body;
    header.appendChild(el);
  }

  return el;
}

function renderAuthBar() {
  contenedorAuth().innerHTML = authBarHTML(getCurrentUser());
}

function abrirAuthModal(mode = "login") {
  modoActual = mode;

  cerrarAuthModal();

  const wrapper = document.createElement("div");
  wrapper.id = "auth-modal-root";
  wrapper.innerHTML = authModalHTML(mode);

  document.body.appendChild(wrapper);

  document.getElementById("auth-identifier")?.focus();
  document.getElementById("auth-username")?.focus();
}

function cerrarAuthModal() {
  document.getElementById("auth-modal-root")?.remove();
}

async function submitAuth(e) {
  e.preventDefault();

  const password = document.getElementById("auth-password")?.value.trim();

  try {
    if (modoActual === "login") {
      const identifier = document.getElementById("auth-identifier")?.value.trim();

      if (!identifier || !password) {
        showToast("Completa usuario y contrasena.", "error");
        return;
      }

      const user = await login(identifier, password);
      showToast(`Bienvenido, ${user.username}.`, "success");
    } else {
      const username = document.getElementById("auth-username")?.value.trim();
      const email = document.getElementById("auth-email")?.value.trim();

      if (!username || !email || !password) {
        showToast("Completa todos los campos.", "error");
        return;
      }

      const user = await register(username, email, password);
      showToast(`Cuenta creada: ${user.username}.`, "success");
    }

    cerrarAuthModal();
    renderAuthBar();
  } catch (error) {
    showToast(error.message, "error");
  }
}

export function iniciarAuth() {
  renderAuthBar();

  document.addEventListener("click", (e) => {
    if (e.target.closest("#btn-login-open")) abrirAuthModal("login");
    if (e.target.closest("#btn-register-open")) abrirAuthModal("register");

    if (e.target.closest("#btn-auth-close") || e.target.closest("#auth-overlay")) {
      cerrarAuthModal();
    }

    if (e.target.closest("#btn-logout")) {
      logout();
      renderAuthBar();
      showToast("Sesion cerrada.", "info");
    }

    if (e.target.closest("#btn-admin-panel")) {
      window.location.hash = "admin";
      showToast("Abriendo panel admin...", "info");
    }
  });

  document.addEventListener("submit", (e) => {
    if (e.target.id === "auth-form") submitAuth(e);
  });

  window.addEventListener("mf:open-login", () => abrirAuthModal("login"));
}

