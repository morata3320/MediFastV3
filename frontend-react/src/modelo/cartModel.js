const CART_KEY = "mf_cart_react";

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(items, producto) {
  const existe = items.find((item) => item.id === producto.id);
  const stock = Number(producto.stockActual ?? producto.stock ?? 0);
  if (stock <= 0 || (existe && existe.cantidad >= stock)) return items;

  if (existe) {
    return items.map((item) =>
      item.id === producto.id
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    );
  }

  return [...items, { ...producto, cantidad: 1 }];
}

export function updateQty(items, id, delta) {
  return items
    .map((item) =>
      item.id === id
        ? { ...item, cantidad: Math.min(item.cantidad + delta, Number(item.stockActual ?? item.stock ?? 0)) }
        : item
    )
    .filter((item) => item.cantidad > 0);
}

export function removeItem(items, id) {
  return items.filter((item) => item.id !== id);
}

export function getTotals(items) {
  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.precio ?? item.precioVenta ?? 0) * Number(item.cantidad),
    0
  );

  const envio = items.length > 0 ? 2.5 : 0;
  const total = subtotal + envio;

  return { subtotal, envio, total };
}
