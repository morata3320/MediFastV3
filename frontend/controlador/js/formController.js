/**
 * CONTROLLER — FormController
 * Responsabilidad: validar el formulario de checkout
 * y registrar el pedido real en la API REST.
 */

import {
  vaciar,
  getItems,
  getTotales,
  setCookieCompra
} from "../../modelo/js/cartModel.js";

import { registrarEvento } from "../../modelo/js/productModel.js";
import { crearPedido } from "../../modelo/js/orderModel.js";
import { isAuthenticated } from "../../modelo/js/authModel.js";

import {
  cerrarModal,
  showToast
} from "../../vista/js/uiView.js";

import { renderCarrito } from "./cartController.js";

const REGLAS = {
  "f-nombre": [/^[a-zA-ZaeiouAEIOUnNuU\s]{3,60}$/, "Escribe un nombre valido."],
  "f-email": [/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, "Escribe un correo valido."],
  "f-telefono": [/^(\+593|0)[2-9][0-9]{7,8}$/, "Escribe un telefono ecuatoriano valido."],
  "f-cedula": [/^[0-9]{10}$/, "La cedula debe tener 10 digitos."],
  "f-direccion": [/^.{3,150}$/, "Escribe una direccion valida."],
  "f-ciudad": [/^[a-zA-ZaeiouAEIOUnN\s]{3,40}$/, "Escribe una ciudad valida."],
  "f-tarjeta": [/^[0-9]{16}$/, "La tarjeta debe tener 16 digitos."],
  "f-vencimiento": [/^(0[1-9]|1[0-2])\/([2-9][0-9])$/, "Usa el formato MM/AA."],
  "f-cvv": [/^[0-9]{3,4}$/, "El CVV debe tener 3 o 4 digitos."]
};

function validarCampo(id) {
  const input = document.getElementById(id);
  const error = document.getElementById(`${id}-err`);
  if (!input || !error) return true;

  const [regex, mensaje] = REGLAS[id];
  const valido = regex.test(input.value.trim());

  input.setAttribute("aria-invalid", String(!valido));
  error.textContent = valido ? "" : mensaje;

  return valido;
}

function validarFormulario() {
  const resultados = Object.keys(REGLAS).map(validarCampo);
  const valido = resultados.every(Boolean);

  if (!valido) {
    document.querySelector('[aria-invalid="true"]')?.focus();
    showToast("Corrige los campos marcados.", "error");
  }

  return valido;
}

async function procesarPedido() {
  const items = getItems();

  if (items.length === 0) {
    showToast("El carrito esta vacio.", "error");
    return;
  }

  if (!isAuthenticated()) {
    showToast("Debes iniciar sesion para comprar.", "error");
    window.dispatchEvent(new CustomEvent("mf:open-login"));
    return;
  }

  try {
    const totales = getTotales();

    showToast("Registrando pedido...", "info");

    const pedido = await crearPedido(items);

    setCookieCompra();
    registrarEvento("compra", `$${totales.total.toFixed(2)}`);

    vaciar();
    renderCarrito();
    cerrarModal();

    document.getElementById("form-checkout")?.reset();

    showToast(`Pedido confirmado correctamente. Codigo #${pedido.id}`, "success");
  } catch (error) {
    showToast(error.message || "No se pudo confirmar el pedido.", "error");
  }
}

function iniciarFormatos() {
  document.getElementById("f-tarjeta")?.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16);
  });

  document.getElementById("f-cvv")?.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  });

  document.getElementById("f-cedula")?.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
  });

  document.getElementById("f-vencimiento")?.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length >= 2) v = `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    e.target.value = v;
  });
}

export function iniciarEventosFormulario() {
  iniciarFormatos();

  document.getElementById("form-checkout")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validarFormulario()) procesarPedido();
  });
}