import {
  obtenerProductosAdmin,
  crearProductoAdmin,
  actualizarProductoAdmin,
  eliminarProductoAdmin,
  obtenerPedidosAdmin,
  obtenerUsuariosAdmin
} from "../../modelo/js/adminModel.js";

import { isAdmin } from "../../modelo/js/authModel.js";

import {
  adminPanelHTML,
  productoRowsHTML,
  pedidosHTML,
  usuariosRowsHTML
} from "../../vista/js/adminView.js";

import { showToast } from "../../vista/js/uiView.js";

let productosCache = [];

function cerrarPanelAdmin() {
  document.getElementById("admin-panel")?.remove();
  if (window.location.hash === "#admin") {
    history.replaceState(null, "", window.location.pathname);
  }
}

async function cargarProductos() {
  const tbody = document.getElementById("admin-productos");
  if (!tbody) return;

  productosCache = await obtenerProductosAdmin();
  tbody.innerHTML = productoRowsHTML(productosCache);
}

async function cargarPedidos() {
  const contenedor = document.getElementById("admin-pedidos");
  if (!contenedor) return;

  const pedidos = await obtenerPedidosAdmin();
  contenedor.innerHTML = pedidosHTML(pedidos);
}

async function cargarUsuarios() {
  const tbody = document.getElementById("admin-usuarios");
  if (!tbody) return;

  const usuarios = await obtenerUsuariosAdmin();
  tbody.innerHTML = usuariosRowsHTML(usuarios);
}

async function abrirPanelAdmin() {
  if (!isAdmin()) {
    showToast("Solo el administrador puede acceder al panel.", "error");
    return;
  }

  cerrarPanelAdmin();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = adminPanelHTML();
  document.body.appendChild(wrapper.firstElementChild);

  try {
    await cargarProductos();
    await cargarPedidos();
    await cargarUsuarios();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function limpiarFormulario() {
  document.getElementById("admin-product-id").value = "";
  document.getElementById("admin-form-title").textContent = "Crear producto";
  document.getElementById("admin-product-form").reset();
}

function llenarFormulario(producto) {
  document.getElementById("admin-product-id").value = producto.id;
  document.getElementById("admin-form-title").textContent = `Editar producto #${producto.id}`;

  document.getElementById("admin-nombre").value = producto.nombre || "";
  document.getElementById("admin-categoria").value = producto.categoria || "";
  document.getElementById("admin-precio").value = producto.precio ?? "";
  document.getElementById("admin-stock").value = producto.stock ?? "";
  document.getElementById("admin-descripcion").value = producto.descripcion || "";
  document.getElementById("admin-imagen").value = producto.imagen || "";
  document.getElementById("admin-laboratorio").value = producto.laboratorio || "";
  document.getElementById("admin-receta").checked = Boolean(producto.requiereReceta);
  document.getElementById("admin-oferta").checked = Boolean(producto.oferta);

  document.getElementById("admin-nombre").focus();
}

function obtenerFormularioProducto() {
  return {
    nombre: document.getElementById("admin-nombre").value.trim(),
    categoria: document.getElementById("admin-categoria").value.trim(),
    precio: Number(document.getElementById("admin-precio").value),
    stock: Number(document.getElementById("admin-stock").value),
    descripcion: document.getElementById("admin-descripcion").value.trim(),
    imagen: document.getElementById("admin-imagen").value.trim() || "assets/placeholder.svg",
    laboratorio: document.getElementById("admin-laboratorio").value.trim(),
    requiereReceta: document.getElementById("admin-receta").checked,
    oferta: document.getElementById("admin-oferta").checked
  };
}

async function guardarProductoAdmin(e) {
  e.preventDefault();

  const id = document.getElementById("admin-product-id").value;
  const producto = obtenerFormularioProducto();

  try {
    if (id) {
      await actualizarProductoAdmin(id, producto);
      showToast("Producto actualizado correctamente.", "success");
    } else {
      await crearProductoAdmin(producto);
      showToast("Producto creado correctamente.", "success");
    }

    limpiarFormulario();
    await cargarProductos();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function eliminarProductoDesdePanel(id) {
  const confirmar = confirm(`Eliminar producto #${id}?`);
  if (!confirmar) return;

  try {
    await eliminarProductoAdmin(id);
    showToast("Producto eliminado correctamente.", "success");
    await cargarProductos();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function manejarClicks(e) {
  if (e.target.closest("#btn-admin-close")) {
    cerrarPanelAdmin();
  }

  if (e.target.closest("#btn-admin-form-clear")) {
    limpiarFormulario();
  }

  const btnEdit = e.target.closest(".btn-admin-edit");
  if (btnEdit) {
    const id = Number(btnEdit.dataset.id);
    const producto = productosCache.find((p) => p.id === id);
    if (producto) llenarFormulario(producto);
  }

  const btnDelete = e.target.closest(".btn-admin-delete");
  if (btnDelete) {
    eliminarProductoDesdePanel(btnDelete.dataset.id);
  }
}

export function iniciarAdmin() {
  document.addEventListener("click", manejarClicks);

  document.addEventListener("submit", (e) => {
    if (e.target.id === "admin-product-form") {
      guardarProductoAdmin(e);
    }
  });

  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#admin") abrirPanelAdmin();
  });

  if (window.location.hash === "#admin") abrirPanelAdmin();

  window.addEventListener("mf:open-admin", abrirPanelAdmin);
}