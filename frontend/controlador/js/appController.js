/**
 * CONTROLLER — AppController  (punto de entrada principal)
 * Responsabilidad: orquestar la inicializacion de la app,
 * coordinar Model y View para el catalogo de productos,
 * busqueda y filtros de categoria.
 */

import {
  cargarProductos,
  registrarEvento,
  filtrarPorCategoria,
  filtrarPorTexto,
  obtenerCategorias,
} from '../../modelo/js/productModel.js';

import {
  tarjetaProducto,
  renderCategorias,
  loaderHTML,
  sinResultados,
  errorCarga,
} from '../../vista/js/productView.js';

import {
  resumenOrden,
  abrirCarrito as _abrirCarrito,
  cerrarCarrito as _cerrarCarrito,
} from '../../vista/js/cartView.js';

import {
  showToast,
  abrirModal,
  cerrarModal,
  actualizarTituloCatalogo,
} from '../../vista/js/uiView.js';

import {
  renderCarrito,
  onAgregarProducto,
  iniciarEventosCarrito,
  getItems,
  getTotales,
} from './cartController.js';

import { iniciarEventosFormulario } from './formController.js';

// ── Estado del catalogo ────────────────────────────────────

let productos        = [];
let categoriaActiva  = 'Todos';
let textoBusqueda    = '';

// ── Elementos del DOM ──────────────────────────────────────

const grid       = () => document.getElementById('productos-grid');
const catFilter  = () => document.getElementById('cat-filter');
const searchInput = () => document.getElementById('search-input');

// ── Render catalogo ────────────────────────────────────────

function renderProductos() {
  const el = grid();
  if (!el) return;

  let lista = filtrarPorCategoria(productos, categoriaActiva);
  lista     = filtrarPorTexto(lista, textoBusqueda);

  if (lista.length === 0) {
    el.innerHTML = sinResultados(textoBusqueda || categoriaActiva);
    el.removeAttribute('role');
    return;
  }

  el.setAttribute('role', 'list');
  el.innerHTML = lista.map(tarjetaProducto).join('');
}

function renderCats() {
  const el = catFilter();
  if (!el) return;
  el.innerHTML = renderCategorias(obtenerCategorias(productos), categoriaActiva);
}

function actualizarCatPills() {
  catFilter()?.querySelectorAll('.cat-pill').forEach((btn) => {
    const activo = btn.dataset.cat === categoriaActiva;
    btn.classList.toggle('active', activo);
    btn.setAttribute('aria-pressed', String(activo));
  });
}

// ── Eventos del catalogo ───────────────────────────────────

function iniciarEventosCatalogo() {
  // Agregar al carrito (event delegation en el grid)
  grid()?.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add');
    if (!btn || btn.disabled) return;

    const id      = Number(btn.dataset.id);
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    onAgregarProducto(producto);
    registrarEvento('agregar', producto.nombre);

    // Feedback visual en el boton
    btn.textContent = 'Agregado ✓';
    setTimeout(() => { btn.textContent = 'Agregar'; }, 1200);
  });

  // Filtros de categoria
  catFilter()?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-pill');
    if (!btn) return;

    categoriaActiva = btn.dataset.cat;
    textoBusqueda   = '';
    if (searchInput()) searchInput().value = '';

    actualizarTituloCatalogo(categoriaActiva);
    actualizarCatPills();
    renderProductos();
  });

  // Nav principal
  document.querySelectorAll('.main-nav a').forEach((a) => {
    a.addEventListener('click', () => {
      const cat = a.dataset.cat;

      document.querySelectorAll('.main-nav a').forEach((item) => {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      });
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');

      if (cat) {
        categoriaActiva = cat;
        textoBusqueda   = '';
        if (searchInput()) searchInput().value = '';

        actualizarTituloCatalogo(categoriaActiva);
        actualizarCatPills();
        renderProductos();
      }
    });
  });

  // Busqueda con debounce
  let timer;
  searchInput()?.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      textoBusqueda = e.target.value;
      renderProductos();
    }, 300);
  });

  document.getElementById('search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    textoBusqueda = searchInput()?.value ?? '';
    renderProductos();
  });
}

// ── Checkout ───────────────────────────────────────────────

function iniciarEventosCheckout() {
  document.getElementById('btn-checkout')?.addEventListener('click', () => {
    const items = getItems();

    if (items.length === 0) {
      showToast('El carrito esta vacio.', 'error');
      return;
    }

    _cerrarCarrito();
    abrirModal(resumenOrden(items, getTotales()));
  });

  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', cerrarModal);
  });

  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) cerrarModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      _cerrarCarrito();
      cerrarModal();
    }
  });
}

// ── Init ───────────────────────────────────────────────────

export async function init() {
  sessionStorage.setItem('mf_sesion_inicio', new Date().toISOString());

  const el = grid();
  if (el) {
    el.innerHTML = loaderHTML();
    el.setAttribute('aria-busy', 'true');
  }

  try {
    productos = await cargarProductos();
    renderCats();
    renderProductos();
    el?.setAttribute('aria-busy', 'false');
  } catch (err) {
    if (el) el.innerHTML = errorCarga();
    console.error(err);
  }

  renderCarrito();
  iniciarEventosCarrito();
  iniciarEventosCatalogo();
  iniciarEventosCheckout();
  iniciarEventosFormulario();
}



