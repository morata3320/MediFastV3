/**
 * MODEL — CartModel
 * Responsabilidad: estado del carrito y persistencia
 * (localStorage + sessionStorage + cookies).
 * No toca el DOM en ningun momento.
 */

const LS_KEY     = 'mf_cart';
const SS_KEY     = 'mf_cart_session';
const COOKIE_KEY = 'mf_ultima_compra';
const UPDATE_KEY = 'mf_ultima_actualizacion';

// ── Persistencia ───────────────────────────────────────────

function guardarFecha() {
  localStorage.setItem(UPDATE_KEY, new Date().toISOString());
}

function leerLS() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function persistir(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
  sessionStorage.setItem(SS_KEY, JSON.stringify(items));
  guardarFecha();
}

// ── Estado interno ─────────────────────────────────────────

let _carrito = leerLS();

// ── Getters ────────────────────────────────────────────────

export const getItems = () => [..._carrito];

export const getCantidadTotal = () =>
  _carrito.reduce((t, i) => t + i.cantidad, 0);

export const getSubtotal = () =>
  _carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);

export function getTotales() {
  const subtotal = getSubtotal();
  const envio    = subtotal > 0 && subtotal < 20 ? 2.5 : 0;
  return { subtotal, envio, total: subtotal + envio };
}

// ── Mutaciones ─────────────────────────────────────────────

export function agregarItem(producto) {
  const existe = _carrito.find((i) => i.id === producto.id);

  if (existe) {
    existe.cantidad += 1;
  } else {
    _carrito.push({
      id:          producto.id,
      nombre:      producto.nombre,
      precio:      producto.precio,
      imagen:      producto.imagen,
      laboratorio: producto.laboratorio || '',
      unidad:      producto.unidad || '',
      cantidad:    1,
    });
  }

  persistir(_carrito);
  return getItems();
}

export function eliminarItem(id) {
  _carrito = _carrito.filter((i) => i.id !== id);
  persistir(_carrito);
  return getItems();
}

export function cambiarCantidad(id, delta) {
  const item = _carrito.find((i) => i.id === id);
  if (!item) return getItems();

  item.cantidad += delta;
  if (item.cantidad <= 0) return eliminarItem(id);

  persistir(_carrito);
  return getItems();
}

export function vaciar() {
  _carrito = [];
  persistir(_carrito);
  return [];
}

export function sincronizar() {
  _carrito = leerLS();
  return getItems();
}

// ── Cookies ────────────────────────────────────────────────

export function setCookieCompra() {
  const exp = new Date();
  exp.setDate(exp.getDate() + 30);

  document.cookie =
    `${COOKIE_KEY}=${encodeURIComponent(new Date().toISOString())};` +
    `expires=${exp.toUTCString()};path=/;SameSite=Strict`;

  guardarFecha();
}

export function getCookieCompra() {
  const m = document.cookie.match(new RegExp(`${COOKIE_KEY}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function getUltimaActualizacion() {
  return localStorage.getItem(UPDATE_KEY);
}
