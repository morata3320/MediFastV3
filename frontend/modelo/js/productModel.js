/**
 * MODELO — ProductModel
 * Responsabilidad: consumir productos desde la API REST.
 * Fuente principal: Backend Express /api/productos.
 * Fuente secundaria: JSON local como respaldo temporal.
 */

const API_URL = "http://localhost:3000/api/productos";

export async function registrarEvento(tipo, detalle = "") {
  try {
    console.log(`[Evento] ${tipo}: ${detalle}`);
  } catch {
    console.warn("[ProductModel] No se pudo registrar el evento.");
  }
}

async function cargarDesdeApi() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status}`);
  }

  const json = await res.json();

  if (!Array.isArray(json.data)) {
    throw new Error("Respuesta invalida desde la API.");
  }

  return json.data;
}

async function cargarDesdeJsonLocal() {
  const res = await fetch("../modelo/data/productos.json");

  if (!res.ok) {
    throw new Error("No se pudo cargar productos.json local.");
  }

  return await res.json();
}

export async function cargarProductos() {
  try {
    const productos = await cargarDesdeApi();
    registrarEvento("carga", "api");
    return productos;
  } catch (error) {
    console.warn("[ProductModel] API no disponible. Usando JSON local.", error.message);

    const productosLocales = await cargarDesdeJsonLocal();
    registrarEvento("carga", "json-local");

    return productosLocales;
  }
}

export function filtrarPorCategoria(productos, categoria) {
  if (!categoria || categoria === "Todos") return productos;
  return productos.filter((p) => p.categoria === categoria);
}

export function filtrarPorTexto(productos, texto) {
  if (!texto?.trim()) return productos;

  const q = texto.toLowerCase();

  return productos.filter((p) =>
    p.nombre.toLowerCase().includes(q) ||
    p.descripcion.toLowerCase().includes(q) ||
    p.categoria.toLowerCase().includes(q) ||
    (p.laboratorio || "").toLowerCase().includes(q)
  );
}

export function obtenerCategorias(productos) {
  return ["Todos", ...new Set(productos.map((p) => p.categoria))];
}
