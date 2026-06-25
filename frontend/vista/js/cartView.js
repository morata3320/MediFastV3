/**
 * VIEW — CartView
 * Responsabilidad: generar HTML del carrito (items, totales,
 * resumen de orden) y manejar apertura/cierre del sidebar.
 * No modifica el estado del carrito.
 */

import { esc, fmt } from './uiView.js';

// ── Item individual ────────────────────────────────────────

export function itemCarrito(item) {
  return `
    <div
      class="cart-item"
      data-id="${item.id}"
      role="listitem"
      aria-label="${esc(item.nombre)}"
    >
      <img
        class="ci-img"
        src="${esc(item.imagen)}"
        alt="${esc(item.nombre)}"
        loading="lazy"
        onerror="this.src='assets/placeholder.svg'; this.onerror=null;"
      />

      <div class="ci-info">
        <p class="ci-name">${esc(item.nombre)}</p>
        <p class="ci-price">
          ${fmt(item.precio)} c/u · <strong>${fmt(item.precio * item.cantidad)}</strong>
        </p>

        <div class="qty-ctrl" role="group" aria-label="Cantidad de ${esc(item.nombre)}">
          <button class="qty-btn btn-minus" type="button" data-id="${item.id}"
                  aria-label="Reducir cantidad de ${esc(item.nombre)}">−</button>
          <span class="qty-n" aria-live="polite">${item.cantidad}</span>
          <button class="qty-btn btn-plus" type="button" data-id="${item.id}"
                  aria-label="Aumentar cantidad de ${esc(item.nombre)}">+</button>
        </div>
      </div>

      <button class="btn-rm" type="button" data-id="${item.id}"
              aria-label="Eliminar ${esc(item.nombre)}">
        Eliminar
      </button>
    </div>
  `;
}

// ── Carrito vacio ──────────────────────────────────────────

export const carritoVacio = () => `
  <div class="cart-empty" role="status" aria-live="polite">
    <p><strong>Tu carrito esta vacio</strong></p>
    <p>Agrega productos desde el catalogo.</p>
  </div>
`;

// ── Resumen de orden (dentro del modal checkout) ───────────

export function resumenOrden(items, totales) {
  const lineas = items.map((item) => `
    <div class="order-line">
      <span>${esc(item.nombre)} × ${item.cantidad}</span>
      <strong>${fmt(item.precio * item.cantidad)}</strong>
    </div>
  `).join('');

  const envioTexto = totales.envio > 0 ? fmt(totales.envio) : 'Gratis';

  return `
    <div class="order-summary" role="region" aria-label="Resumen del pedido">
      <h3>Resumen del pedido</h3>
      ${lineas}
      <div class="order-line">
        <span>Envio</span>
        <strong>${envioTexto}</strong>
      </div>
      <div class="order-line total-line">
        <span>Total</span>
        <strong>${fmt(totales.total)}</strong>
      </div>
    </div>
  `;
}

// ── Actualizar totales en el DOM ───────────────────────────

export function actualizarTotalesDom(totales) {
  const subt  = document.getElementById('cart-subt');
  const envio = document.getElementById('cart-envio');
  const total = document.getElementById('cart-total');

  if (subt)  subt.textContent  = `$${totales.subtotal.toFixed(2)}`;
  if (envio) envio.textContent = totales.envio > 0 ? `$${totales.envio.toFixed(2)}` : 'Gratis';
  if (total) total.textContent = `$${totales.total.toFixed(2)}`;
}

// ── Badge del carrito ──────────────────────────────────────

export function actualizarBadge(cantidad) {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  badge.textContent = cantidad;
  badge.setAttribute('aria-label', `${cantidad} productos en el carrito`);
  badge.style.display = cantidad > 0 ? 'grid' : 'none';
}

// ── Sidebar open / close ───────────────────────────────────

export function abrirCarrito() {
  const sidebar  = document.getElementById('cart-sidebar');
  const overlay  = document.getElementById('cart-overlay');
  const btnAbrir = document.getElementById('btn-abrir-carrito');

  sidebar?.classList.add('open');
  overlay?.classList.add('open');
  sidebar?.setAttribute('aria-hidden', 'false');
  btnAbrir?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  document.getElementById('btn-cerrar-carrito')?.focus();
}

export function cerrarCarrito() {
  const sidebar  = document.getElementById('cart-sidebar');
  const overlay  = document.getElementById('cart-overlay');
  const btnAbrir = document.getElementById('btn-abrir-carrito');

  sidebar?.classList.remove('open');
  overlay?.classList.remove('open');
  sidebar?.setAttribute('aria-hidden', 'true');
  btnAbrir?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
