import { describe, expect, jest, test } from "@jest/globals";

const tx = {
  producto: {
    findMany: jest.fn(),
    updateMany: jest.fn()
  },
  tipoMovimientoInventario: { findUnique: jest.fn() },
  estadoPedido: { findUnique: jest.fn() },
  metodoPago: { findUnique: jest.fn() },
  usuario: { findUnique: jest.fn() },
  cliente: { create: jest.fn(), update: jest.fn() },
  direccionCliente: { create: jest.fn() },
  pedido: { create: jest.fn(), findUnique: jest.fn() },
  movimientoInventario: { create: jest.fn() },
  pago: { create: jest.fn() }
};

const transaction = jest.fn((callback) => callback(tx));

jest.unstable_mockModule("../modelo/js/prismaClient.js", () => ({
  prisma: { $transaction: transaction }
}));

const { createPedido } = await import("../modelo/js/pedido.model.js");

function prepararTransaccion() {
  jest.clearAllMocks();
  tx.producto.findMany.mockResolvedValue([{ id: 5, nombre: "Producto", precioVenta: 10, stockActual: 4 }]);
  tx.tipoMovimientoInventario.findUnique.mockResolvedValue({ id: 3, nombre: "SALIDA_VENTA" });
  tx.estadoPedido.findUnique.mockResolvedValue({ id: 1, nombre: "Pendiente" });
  tx.metodoPago.findUnique.mockResolvedValue({ id: 2, nombre: "Tarjeta" });
  tx.usuario.findUnique.mockResolvedValue({ id: 2, email: "user@example.com", cliente: null });
  tx.cliente.create.mockResolvedValue({ id: 8 });
  tx.direccionCliente.create.mockResolvedValue({ id: 9 });
  tx.pedido.create.mockResolvedValue({ id: 20 });
  tx.producto.updateMany.mockResolvedValue({ count: 1 });
  tx.pedido.findUnique.mockResolvedValue({ id: 20, pagos: [{ tarjetaUltimos4: "1111" }] });
}

describe("createPedido", () => {
  test("crea detalle, pago y movimiento de inventario en una transaccion", async () => {
    prepararTransaccion();

    const pedido = await createPedido(
      2,
      [{ productoId: 5, cantidad: 2 }],
      { metodo: "Tarjeta", tarjeta: "4111111111111111" },
      {
        cliente: { nombres: "Ana Perez", apellidos: "Perez", cedula: "1234567890", telefono: "0991234567", email: "ana@example.com" },
        direccion: { ciudad: "Quito", direccion: "Av. Principal 123", referencia: "Casa azul" }
      }
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(tx.pedido.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ clienteId: 8, direccionClienteId: 9, total: 22.5 })
    }));
    expect(tx.movimientoInventario.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ productoId: 5, cantidad: 2, stockAnterior: 4, stockNuevo: 2, motivo: "Salida por venta", referencia: "Pedido #20" })
    }));
    expect(tx.pago.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ pedidoId: 20, metodoPagoId: 2, tarjetaUltimos4: "1111" })
    }));
    expect(pedido.id).toBe(20);
  });

  test("rechaza stock insuficiente antes de descontar inventario", async () => {
    prepararTransaccion();
    tx.producto.findMany.mockResolvedValue([{ id: 5, nombre: "Producto", precioVenta: 10, stockActual: 1 }]);

    await expect(createPedido(2, [{ productoId: 5, cantidad: 2 }], { metodo: "Efectivo" })).rejects.toThrow("Stock insuficiente");
    expect(tx.producto.updateMany).not.toHaveBeenCalled();
  });
});
