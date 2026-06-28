import { describe, expect, test } from "vitest";
import { formatCardNumber, normalizeDecimal, onlyDigits, validateCedula, validateCvv, validateTarjeta, validateVencimiento } from "./checkoutValidation.js";

describe("validaciones de checkout", () => {
  test("valida cédula de 10 dígitos", () => {
    expect(validateCedula("1234567890")).toBe(true);
    expect(validateCedula("123")).toBe(false);
  });

  test("valida tarjeta numérica de máximo 16 dígitos", () => {
    expect(validateTarjeta("4111111111111111")).toBe(true);
    expect(validateTarjeta("4111-1111")).toBe(false);
  });

  test("formatea tarjeta visualmente y conserva solo números internamente", () => {
    expect(formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111");
    expect(onlyDigits("4111 1111-abcd")).toBe("41111111");
  });

  test("valida vencimiento MM/AA", () => {
    expect(validateVencimiento("12/30")).toBe(true);
    expect(validateVencimiento("13/30")).toBe(false);
  });

  test("valida CVV de tres o cuatro dígitos", () => {
    expect(validateCvv("123")).toBe(true);
    expect(validateCvv("12")).toBe(false);
  });

  test("normaliza precio decimal con coma a punto", () => {
    expect(normalizeDecimal("4,25")).toBe("4.25");
  });
});
