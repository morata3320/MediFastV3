/**
 * CONTROLLER — CartController
 * Responsabilidad: coordinar interacciones del usuario
 * con el carrito (agregar, quitar, cambiar cantidad, vaciar)
 * entre CartModel y CartView.
 */

import {
  getItems,
  getCantidadTotal,
  getTotales,
  agregarItem,
  eliminarItem,
  cambiarCantidad,
  vaciar,
  sincronizar,
} from '../../modelo/js/cartModel.js';

import {
  itemCarrito,
  carritoVacio,
  actualizarTotalesDom,
  actualizarBadge,
  abrirCarrito,
  cerrarCarrito,
} from '../../vista/js/cartView.js';

import { showToast } from '../../vista/js/uiView.js';

// ── Render completo del carrito ────────────────────────────

export function renderCarrito() {
  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;

  const items = getItems();

  if (items.length === 0) {
    cartItems.innerHTML = carritoVacio();
    cartItems.removeAttribute('role');
  } else {
    cartItems.setAttribute('role', 'list');
    cartItems.innerHTML = items.map(itemCarrito).join('');
  }

  actualizarTotalesDom(getTotales());
  actualizarBadge(getCantidadTotal());
}

// ── Acciones publicas ──────────────────────────────────────

export function onAgregarProducto(producto) {
  agregarItem(producto);
  renderCarrito();
  showToast(`${producto.nombre} agregado al carrito.`, 'success');
}

export function onEliminarItem(id) {
  eliminarItem(id);
  renderCarrito();
  showToast('Producto eliminado.', 'info');
}

export function onCambiarCantidad(id, delta) {
  cambiarCantidad(id, delta);
  renderCarrito();
}

export function onVaciarCarrito() {
  if (!confirm('¿Deseas vaciar el carrito?')) return;
  vaciar();
  renderCarrito();
  showToast('Carrito vaciado.', 'info');
}

export function onSincronizar() {
  sincronizar();
  renderCarrito();
}

// ── Evento delegado en el sidebar ─────────────────────────

export function iniciarEventosCarrito() {
  const cartItems = document.getElementById('cart-items');

  cartItems?.addEventListener('click', (e) => {
    const contenedor = e.target.closest('[data-id]');
    if (!contenedor) return;

    const id = Number(contenedor.dataset.id);

    if (e.target.closest('.btn-rm'))    onEliminarItem(id);
    if (e.target.closest('.btn-plus'))  onCambiarCantidad(id,  1);
    if (e.target.closest('.btn-minus')) onCambiarCantidad(id, -1);
  });

  document.getElementById('btn-abrir-carrito')
    ?.addEventListener('click', abrirCarrito);

  document.getElementById('btn-cerrar-carrito')
    ?.addEventListener('click', cerrarCarrito);

  document.getElementById('cart-overlay')
    ?.addEventListener('click', cerrarCarrito);

  document.getElementById('btn-vaciar')
    ?.addEventListener('click', onVaciarCarrito);

  // Sincronizar carrito si se abre en otra pestana
  window.addEventListener('storage', (e) => {
    if (e.key === 'mf_cart') onSincronizar();
  });
}

// ── Getters re-exportados para otros controllers ───────────

export { getItems, getTotales, getCantidadTotal };



