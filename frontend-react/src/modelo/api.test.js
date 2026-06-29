import { afterEach, describe, expect, test, vi } from "vitest";
import { ApiError, getCurrentUser, getToken, logoutSession, pedidosApi, productosApi, saveSession, usuariosApi } from "./api.js";

function storageMock() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("sesión de MediFast", () => {
  test("guarda token y usuario en localStorage", () => {
    vi.stubGlobal("localStorage", storageMock());
    saveSession({ token: "jwt-de-prueba", user: { id: 1, username: "admin", role: "admin" } });

    expect(getToken()).toBe("jwt-de-prueba");
    expect(getCurrentUser()).toMatchObject({ username: "admin", role: "admin" });

    logoutSession();
    expect(getToken()).toBeNull();
  });

  test("propaga 401 con mensaje controlado", async () => {
    vi.stubGlobal("localStorage", storageMock());
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: "Su sesión no es válida. Inicie sesión nuevamente." })
    })));

    await expect(productosApi.listar()).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Su sesión no es válida. Inicie sesión nuevamente."
    });
  });

  test("propaga 403 sin mostrar error falso de red", async () => {
    vi.stubGlobal("localStorage", storageMock());
    saveSession({ token: "jwt-de-prueba", user: { id: 2, username: "user", role: "user" } });
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 403,
      json: async () => ({ message: "No tiene permisos para esta acción." })
    })));

    await expect(usuariosApi.listar()).rejects.toMatchObject({
      status: 403,
      message: "No tiene permisos para esta acción."
    });
  });

  test("usa mensaje de conexión solo ante error real de red", async () => {
    vi.stubGlobal("localStorage", storageMock());
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));

    await expect(productosApi.listar()).rejects.toBeInstanceOf(ApiError);
    await expect(productosApi.listar()).rejects.toMatchObject({
      status: 0,
      message: "No se pudo conectar con el servidor. Verifique que la API esté activa."
    });
  });

  test("propaga 409 de checkout con mensaje limpio", async () => {
    vi.stubGlobal("localStorage", storageMock());
    saveSession({ token: "jwt-de-prueba", user: { id: 2, username: "user", role: "user" } });
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 409,
      json: async () => ({ message: "Ese correo o cédula ya está registrado en otra cuenta. Verifique los datos." })
    })));

    await expect(pedidosApi.crear([], { metodo: "Efectivo" }, {}, {})).rejects.toMatchObject({
      status: 409,
      message: "Ese correo o cédula ya está registrado en otra cuenta. Verifique los datos."
    });
  });
});
