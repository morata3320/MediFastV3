import { describe, expect, test } from "vitest";
import { addToCart, getTotals } from "./cartModel.js";

const producto = { id: 1, nombre: "Producto", precio: 4, stock: 2 };

describe("modelo de carrito", () => {
  test("calcula subtotal, envío y total", () => {
    expect(getTotals([{ ...producto, cantidad: 2 }])).toEqual({ subtotal: 8, envio: 2.5, total: 10.5 });
  });

  test("no permite agregar más unidades que el stock", () => {
    const carrito = [{ ...producto, cantidad: 2 }];
    expect(addToCart(carrito, producto)).toEqual(carrito);
  });
});
