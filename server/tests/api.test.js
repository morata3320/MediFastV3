import { afterAll, beforeAll, describe, expect, jest, test } from "@jest/globals";
import bcrypt from "bcryptjs";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "medifast-test-secret";
process.env.CORS_ORIGIN = "https://medi-fast-v3.vercel.app";

const adminHash = await bcrypt.hash("Admin123!", 4);
const userHash = await bcrypt.hash("User123!", 4);

const usuarios = {
  admin: { id: 1, username: "admin", email: "admin@medifast.test", passwordHash: adminHash, rol: { id: 1, nombre: "admin" } },
  user: { id: 2, username: "user", email: "user@medifast.test", passwordHash: userHash, rol: { id: 2, nombre: "user" } }
};

const createPedidoMock = jest.fn(async (_userId, items, pago) => {
  if (items.some((item) => Number(item.productoId || item.id) === 999)) {
    throw new Error("Stock insuficiente para Producto de prueba");
  }
  if (items.some((item) => Number(item.productoId || item.id) === 409)) {
    const error = new Error("Ese correo o cédula ya está registrado en otra cuenta.");
    error.status = 409;
    throw error;
  }
  return {
    id: 100,
    total: 12.5,
    detalles: items,
    pagos: [{ tarjetaUltimos4: pago.tarjeta?.slice(-4) || pago.tarjetaUltimos4 || null }]
  };
});
const updatePedidoEstadoMock = jest.fn(async (id, estado) => {
  if (estado === "No existe") throw new Error("Estado de pedido no valido.");
  return { id: Number(id), estadoPedido: { nombre: estado } };
});

jest.unstable_mockModule("../modelo/js/usuario.model.js", () => ({
  findUsuarioByEmailOrUsername: jest.fn(async (identifier) => usuarios[identifier] || null),
  createUsuario: jest.fn(),
  findAllUsuarios: jest.fn(async () => []),
  updateUsuarioRol: jest.fn()
}));
jest.unstable_mockModule("../modelo/js/producto.model.js", () => ({
  findAllProductos: jest.fn(async () => []),
  findProductoById: jest.fn(),
  createProducto: jest.fn(),
  updateProducto: jest.fn(),
  deleteProducto: jest.fn()
}));
jest.unstable_mockModule("../modelo/js/categoria.model.js", () => ({
  findActiveCategorias: jest.fn(async () => [{ id: 1, nombre: "Analgesicos", descripcion: null }])
}));
jest.unstable_mockModule("../modelo/js/pedido.model.js", () => ({
  createPedido: createPedidoMock,
  findPedidosByUser: jest.fn(async () => []),
  findAllPedidos: jest.fn(async () => []),
  updatePedidoEstado: updatePedidoEstadoMock
}));

const { default: app } = await import("../controlador/server.js");
const { signToken } = await import("../controlador/utils/jwt.js");

let adminToken;
let userToken;

beforeAll(() => {
  adminToken = signToken({ id: 1, username: "admin", role: "admin" });
  userToken = signToken({ id: 2, username: "user", role: "user" });
});

afterAll(() => jest.restoreAllMocks());

describe("API MediFast RDA 3", () => {
  test("CORS preflight permite PATCH con Authorization", async () => {
    const response = await request(app)
      .options("/api/pedidos/100/estado")
      .set("Origin", "https://medi-fast-v3.vercel.app")
      .set("Access-Control-Request-Method", "PATCH")
      .set("Access-Control-Request-Headers", "Authorization, Content-Type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-methods"]).toContain("PATCH");
    expect(response.headers["access-control-allow-headers"]).toContain("Authorization");
  });

  test("login exitoso de administrador entrega token y usuario seguro", async () => {
    const response = await request(app).post("/api/auth/login").send({ identifier: "admin", password: "Admin123!" });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user).toMatchObject({ id: 1, username: "admin", role: "admin" });
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  test("login incorrecto devuelve 401", async () => {
    const response = await request(app).post("/api/auth/login").send({ identifier: "admin", password: "incorrecta" });
    expect(response.status).toBe(401);
  });

  test("ruta protegida sin token devuelve 401", async () => {
    const response = await request(app).post("/api/pedidos").send({});
    expect(response.status).toBe(401);
  });

  test("usuario comun no accede a ruta admin", async () => {
    const response = await request(app).get("/api/pedidos").set("Authorization", `Bearer ${userToken}`);
    expect(response.status).toBe(403);
  });

  test("administrador accede a ruta admin", async () => {
    const response = await request(app).get("/api/pedidos").set("Authorization", `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
  });

  test("lista categorias activas sin autenticacion", async () => {
    const response = await request(app).get("/api/categorias");
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({ id: 1, nombre: "Analgesicos" });
  });

  test("producto invalido devuelve 400", async () => {
    const response = await request(app)
      .post("/api/productos")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: "", categoria: "", precio: -1, descripcion: "", stock: -1 });
    expect(response.status).toBe(400);
  });

  test("pedido con stock insuficiente devuelve 400", async () => {
    const response = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ productoId: 999, cantidad: 1 }], pago: { metodo: "Efectivo" } });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Stock insuficiente/i);
  });

  test("checkout con tarjeta invalida devuelve 400", async () => {
    const response = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ productoId: 1, cantidad: 1 }], pago: { metodo: "Tarjeta", tarjeta: "123", vencimiento: "15/90", cvv: "1" } });
    expect(response.status).toBe(400);
  });

  test("checkout valido crea pedido con pago", async () => {
    const response = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [{ productoId: 1, cantidad: 1 }],
        pago: { metodo: "Tarjeta", tarjeta: "4111111111111111", vencimiento: "12/30", cvv: "123" },
        cliente: { nombres: "Ana Perez", apellidos: "Perez", cedula: "1234567890", telefono: "0991234567", email: "ana@example.com" },
        direccion: { ciudad: "Quito", direccion: "Av. Principal 123", referencia: "Casa azul" }
      });

    expect(response.status).toBe(201);
    expect(response.body.data.pagos[0].tarjetaUltimos4).toBe("1111");
    expect(createPedidoMock).toHaveBeenCalled();
  });

  test("checkout con correo o cedula de otra cuenta devuelve 409 limpio", async () => {
    const response = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [{ productoId: 409, cantidad: 1 }],
        pago: { metodo: "Efectivo" },
        cliente: { nombres: "Ana Perez", apellidos: "Perez", cedula: "1234567890", telefono: "0991234567", email: "otro@example.com" },
        direccion: { ciudad: "Quito", direccion: "Av. Principal 123" }
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Ese correo o cédula ya está registrado en otra cuenta. Verifique los datos.");
    expect(response.body.message).not.toMatch(/prisma|Unique|dbo\.Cliente/i);
  });

  test("usuario comun no puede cambiar estado de pedido", async () => {
    const response = await request(app)
      .patch("/api/pedidos/100/estado")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ estado: "Pagado" });

    expect(response.status).toBe(403);
  });

  test("administrador puede cambiar estado de pedido", async () => {
    const response = await request(app)
      .patch("/api/pedidos/100/estado")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ estado: "Pagado" });

    expect(response.status).toBe(200);
    expect(response.body.data.estadoPedido.nombre).toBe("Pagado");
  });

  test("estado de pedido inexistente devuelve 400", async () => {
    const response = await request(app)
      .patch("/api/pedidos/100/estado")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ estado: "No existe" });

    expect(response.status).toBe(400);
  });
});
