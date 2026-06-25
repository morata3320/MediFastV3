/**
 * VIEW — UIView
 * Responsabilidad: utilidades de UI compartidas:
 * toasts, modal, escape de HTML, formateo de precio.
 */

// ── Escape HTML ────────────────────────────────────────────

export const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// ── Formato de precio ──────────────────────────────────────

export const fmt = (n) => `$${Number(n).toFixed(2)}`;

// ── Toast ──────────────────────────────────────────────────

export function showToast(mensaje, tipo = 'success') {
  const contenedor = document.getElementById('toast-container');
  if (!contenedor) return;

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.setAttribute('role', 'alert');
  toast.textContent = mensaje;

  contenedor.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

// ── Modal ──────────────────────────────────────────────────

export function abrirModal(contenidoHTML) {
  const overlay = document.getElementById('modal-overlay');
  const resumen = document.getElementById('resumen-orden');

  if (resumen && contenidoHTML) resumen.innerHTML = contenidoHTML;

  overlay?.classList.add('open');
  overlay?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  document.getElementById('f-nombre')?.focus();
}

export function cerrarModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay?.classList.remove('open');
  overlay?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ── Titulo del catalogo ────────────────────────────────────

export function actualizarTituloCatalogo(categoria) {
  const titulo = document.getElementById('titulo-catalogo');
  if (!titulo) return;
  titulo.textContent = categoria === 'Todos'
    ? 'Catalogo de productos'
    : categoria;
}
