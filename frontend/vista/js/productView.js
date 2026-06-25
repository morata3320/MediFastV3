/**
 * VIEW — ProductView
 * Responsabilidad: generar HTML de tarjetas de producto,
 * categorias, loader y estados vacios.
 * No contiene logica de negocio ni accede a datos directamente.
 */

import { esc, fmt } from './uiView.js';

// ── Helpers internos ───────────────────────────────────────

function calcDescuento(original, actual) {
  if (!original) return 0;
  return Math.round(((original - actual) / original) * 100);
}

// ── Tarjeta de producto ────────────────────────────────────

export function tarjetaProducto(producto) {
  const pct    = calcDescuento(producto.precioOriginal, producto.precio);
  const oferta = producto.oferta;
  const receta = producto.requiereReceta;

  const badges = `
    ${oferta ? '<span class="badge badge-oferta" aria-label="En oferta">Oferta</span>' : ''}
    ${receta ? '<span class="badge badge-receta" aria-label="Requiere receta">Receta</span>' : ''}
  `;

  const precioHTML = producto.precioOriginal
    ? `<div class="price-wrap">
         <span class="price-original">${fmt(producto.precioOriginal)}</span>
         <span class="price-current">${fmt(producto.precio)}</span>
         <span class="price-discount">-${pct}%</span>
       </div>`
    : `<div class="price-wrap">
         <span class="price-current">${fmt(producto.precio)}</span>
       </div>`;

  const recetaNotice = receta
    ? '<div class="receta-notice">Requiere receta medica</div>'
    : '';

  const agotado = producto.stock === 0;

  return `
    <article
      class="product-card"
      data-id="${producto.id}"
      role="listitem"
      aria-label="${esc(producto.nombre)}, ${fmt(producto.precio)}"
    >
      <div class="card-badges" aria-hidden="true">${badges}</div>

      <div class="card-img">
        <img
          src="${esc(producto.imagen)}"
          alt="Imagen de ${esc(producto.nombre)}"
          loading="lazy"
          onerror="this.src='assets/placeholder.svg'; this.onerror=null;"
        />
      </div>

      <div class="card-body">
        <span class="card-lab">${esc(producto.laboratorio)}</span>
        <h3 class="card-name">${esc(producto.nombre)}</h3>
        <p class="card-desc">${esc(producto.descripcion)}</p>
        <span class="card-unidad">${esc(producto.unidad)}</span>
      </div>

      <div class="card-foot">
        ${precioHTML}
        <button
          class="btn-add"
          type="button"
          data-id="${producto.id}"
          aria-label="Agregar ${esc(producto.nombre)} al carrito"
          ${agotado ? 'disabled aria-disabled="true"' : ''}
        >
          ${agotado ? 'Agotado' : 'Agregar'}
        </button>
      </div>

      ${recetaNotice}
    </article>
  `;
}

// ── Filtros de categoria ───────────────────────────────────

export function renderCategorias(categorias, activa) {
  return categorias.map((cat) => `
    <button
      class="cat-pill ${cat === activa ? 'active' : ''}"
      type="button"
      data-cat="${esc(cat)}"
      aria-pressed="${cat === activa}"
    >
      ${esc(cat)}
    </button>
  `).join('');
}

// ── Estados ────────────────────────────────────────────────

export const loaderHTML = () => `
  <div class="loader" role="status" aria-label="Cargando productos">
    <div class="spinner" aria-hidden="true"></div>
    <span>Cargando productos...</span>
  </div>
`;

export const sinResultados = (busqueda) => `
  <div class="empty-results" role="status">
    <p>No se encontraron productos para
      <strong>"${esc(busqueda)}"</strong>.
    </p>
  </div>
`;

export const errorCarga = () => `
  <p class="error-load" role="alert">
    No se pudieron cargar los productos.
  </p>
`;
