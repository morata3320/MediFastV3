export function formatExpiry(value) {
  const digits = String(value).replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function validateCedula(value) {
  return /^\d{10}$/.test(String(value));
}

export function validateTelefono(value) {
  return /^[+()\-\s\d]{7,20}$/.test(String(value));
}

export function validateTarjeta(value) {
  return /^\d{1,16}$/.test(String(value));
}

export function validateVencimiento(value) {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(String(value));
}

export function validateCvv(value) {
  return /^\d{3,4}$/.test(String(value));
}

export function validateCheckout(form) {
  const errors = {};
  if (form.nombres.trim().length < 3) errors.nombres = "Ingrese nombres de al menos 3 caracteres.";
  if (form.apellidos && form.apellidos.trim().length < 1) errors.apellidos = "Ingrese apellidos válidos.";
  if (!validateCedula(form.cedula)) errors.cedula = "La cédula debe tener 10 dígitos.";
  if (!validateTelefono(form.telefono)) errors.telefono = "Ingrese un teléfono válido.";
  if (form.ciudad.trim().length < 3) errors.ciudad = "Ingrese una ciudad válida.";
  if (form.direccion.trim().length < 3) errors.direccion = "Ingrese una dirección válida.";

  if (form.metodo === "Tarjeta") {
    if (!validateTarjeta(form.tarjeta)) errors.tarjeta = "La tarjeta debe contener solo números y máximo 16 dígitos.";
    if (!validateVencimiento(form.vencimiento)) errors.vencimiento = "Use el formato MM/AA.";
    if (!validateCvv(form.cvv)) errors.cvv = "El CVV debe tener 3 o 4 dígitos.";
  }
  if (form.metodo === "Transferencia" && !form.comprobante.trim() && !form.referenciaPago.trim()) {
    errors.comprobante = "Ingrese el comprobante o referencia de la transferencia.";
  }
  return errors;
}
