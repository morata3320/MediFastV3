import { afterEach, describe, expect, test, vi } from "vitest";
import { getCurrentUser, getToken, logoutSession, saveSession } from "./api.js";

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
});
