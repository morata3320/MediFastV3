/**
 * app.js — Punto de entrada
 */

import { init } from "./appController.js";
import { iniciarAuth } from "./authController.js";
import { iniciarAdmin } from "./adminController.js";
import { isAuthenticated } from "../../modelo/js/authModel.js";
import { showToast, cerrarModal } from "../../vista/js/uiView.js";

function protegerCheckoutSinLogin() {
  document.addEventListener(
    "click",
    (e) => {
      const boton = e.target.closest("button, a");

      if (!boton || isAuthenticated()) return;

      const texto = (boton.textContent || "").toLowerCase();
      const marca = `${boton.id || ""} ${boton.className || ""} ${boton.dataset?.action || ""}`.toLowerCase();

      const esCheckout =
        texto.includes("finalizar") ||
        texto.includes("confirmar pedido") ||
        texto.includes("confirmar compra") ||
        texto.includes("checkout") ||
        marca.includes("checkout");

      if (!esCheckout) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      cerrarModal();
      showToast("Primero inicia sesion para continuar con la compra.", "error");
      window.dispatchEvent(new CustomEvent("mf:open-login"));
    },
    true
  );
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  iniciarAuth();
  iniciarAdmin();
  protegerCheckoutSinLogin();
});