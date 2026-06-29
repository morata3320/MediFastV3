import { body, param, validationResult } from "express-validator";
import xss from "xss";

function handleValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Datos invalidos",
      errors: errors.array().map((e) => ({
        field: e.path,
        msg: e.msg
      }))
    });
  }

  next();
}

export const validateRegister = [
  body("username")
    .isString().withMessage("username debe ser texto")
    .trim()
    .isLength({ min: 3, max: 40 }).withMessage("username debe tener entre 3 y 40 caracteres")
    .customSanitizer((v) => xss(v)),
  body("email")
    .isEmail().withMessage("email invalido")
    .normalizeEmail(),
  body("password")
    .isString().withMessage("password debe ser texto")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/)
    .withMessage("La contraseña debe tener minimo 8 caracteres e incluir mayuscula, minuscula, numero y simbolo"),
  handleValidation
];

export const validateLogin = [
  body("identifier").optional().isString().trim().isLength({ min: 3, max: 120 }).withMessage("identifier invalido").customSanitizer((v) => xss(v)),
  body("username").optional().isString().trim().isLength({ min: 3, max: 40 }).withMessage("username invalido").customSanitizer((v) => xss(v)),
  body("email").optional().isEmail().withMessage("email invalido").normalizeEmail(),
  body("password")
    .isString().withMessage("password requerido")
    .notEmpty().withMessage("password requerido"),
  body()
    .custom((value) => {
      if (!value.identifier && !value.username && !value.email) {
        throw new Error("Debe enviar identifier, username o email");
      }
      return true;
    }),
  handleValidation
];

export const validateIdParam = [
  param("id")
    .isInt({ min: 1 }).withMessage("id debe ser entero mayor a 0")
    .toInt(),
  handleValidation
];

export const validateProductoCreate = [
  body("nombre")
    .isString().withMessage("nombre debe ser texto")
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage("nombre debe tener entre 2 y 120 caracteres")
    .customSanitizer((v) => xss(v)),
  body("categoria")
    .optional()
    .isString().withMessage("categoria debe ser texto")
    .trim()
    .customSanitizer((v) => xss(v)),
  body("categoriaId")
    .optional()
    .isInt({ min: 1 }).withMessage("categoriaId debe ser un entero valido")
    .toInt(),
  body("precio")
    .optional()
    .isFloat({ min: 0 }).withMessage("precio debe ser numero mayor o igual a 0")
    .toFloat(),
  body("precioVenta")
    .optional()
    .isFloat({ min: 0 }).withMessage("precioVenta debe ser numero mayor o igual a 0")
    .toFloat(),
  body("descripcion")
    .isString().withMessage("descripcion debe ser texto")
    .trim()
    .customSanitizer((v) => xss(v)),
  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("stock debe ser entero mayor o igual a 0")
    .toInt(),
  body("stockActual")
    .optional()
    .isInt({ min: 0 }).withMessage("stockActual debe ser entero mayor o igual a 0")
    .toInt(),
  body().custom((value) => {
    if (value.categoria === undefined && value.categoriaId === undefined) throw new Error("categoria o categoriaId es obligatorio");
    if (value.precio === undefined && value.precioVenta === undefined) throw new Error("precio o precioVenta es obligatorio");
    if (value.stock === undefined && value.stockActual === undefined) throw new Error("stock o stockActual es obligatorio");
    return true;
  }),
  handleValidation
];

export const validateProductoUpdate = [
  body("nombre")
    .optional()
    .isString().withMessage("nombre debe ser texto")
    .trim()
    .customSanitizer((v) => xss(v)),
  body("categoria")
    .optional()
    .isString().withMessage("categoria debe ser texto")
    .trim()
    .customSanitizer((v) => xss(v)),
  body("categoriaId")
    .optional()
    .isInt({ min: 1 }).withMessage("categoriaId debe ser un entero valido")
    .toInt(),
  body("precio")
    .optional()
    .isFloat({ min: 0 }).withMessage("precio debe ser numero mayor o igual a 0")
    .toFloat(),
  body("precioVenta")
    .optional()
    .isFloat({ min: 0 }).withMessage("precioVenta debe ser numero mayor o igual a 0")
    .toFloat(),
  body("descripcion")
    .optional()
    .isString().withMessage("descripcion debe ser texto")
    .trim()
    .customSanitizer((v) => xss(v)),
  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("stock debe ser entero mayor o igual a 0")
    .toInt(),
  body("stockActual")
    .optional()
    .isInt({ min: 0 }).withMessage("stockActual debe ser entero mayor o igual a 0")
    .toInt(),
  handleValidation
];

export const validateUsuarioRol = [
  body("rolId").isInt({ min: 1 }).withMessage("rolId debe ser un entero valido").toInt(),
  handleValidation
];

const textoSeguro = (campo, etiqueta, minimo = 3, maximo = 150) => body(campo)
  .optional()
  .isString().withMessage(`${etiqueta} debe ser texto`)
  .trim()
  .isLength({ min: minimo, max: maximo }).withMessage(`${etiqueta} debe tener entre ${minimo} y ${maximo} caracteres`)
  .customSanitizer((v) => xss(v));

export const validatePedidoCreate = [
  body("items")
    .isArray({ min: 1 }).withMessage("items debe contener al menos un producto"),
  body("items.*.productoId").optional().isInt({ min: 1 }).withMessage("productoId invalido").toInt(),
  body("items.*.id").optional().isInt({ min: 1 }).withMessage("id de producto invalido").toInt(),
  body("items.*.cantidad").optional().isInt({ min: 1 }).withMessage("cantidad debe ser un entero mayor a 0").toInt(),
  body("items.*.qty").optional().isInt({ min: 1 }).withMessage("qty debe ser un entero mayor a 0").toInt(),
  body("pago").isObject().withMessage("pago es obligatorio"),
  body("pago.metodoPagoId")
    .optional()
    .isInt({ min: 1 }).withMessage("metodoPagoId invalido").toInt(),
  body("pago.metodo")
    .optional()
    .isString().withMessage("metodo de pago invalido")
    .trim()
    .isLength({ min: 3, max: 40 }).withMessage("metodo de pago invalido")
    .customSanitizer((v) => xss(v)),
  body("pago")
    .custom((pago) => Boolean(pago?.metodoPagoId || pago?.metodo))
    .withMessage("metodo de pago obligatorio"),
  body("pago.tarjeta")
    .optional()
    .matches(/^\d{1,16}$/).withMessage("tarjeta debe contener solo numeros y maximo 16 digitos"),
  body("pago.vencimiento")
    .optional()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage("vencimiento debe tener formato MM/AA"),
  body("pago.cvv")
    .optional()
    .matches(/^\d{3,4}$/).withMessage("CVV debe tener 3 o 4 digitos"),
  body("pago.tarjetaUltimos4").optional().matches(/^\d{4}$/).withMessage("tarjetaUltimos4 debe tener 4 digitos"),
  body("pago.comprobante").optional().isString().trim().isLength({ min: 3, max: 150 }).withMessage("comprobante invalido").customSanitizer((v) => xss(v)),
  body("pago.referencia").optional().isString().trim().isLength({ min: 3, max: 150 }).withMessage("referencia invalida").customSanitizer((v) => xss(v)),
  body("pago")
    .custom((pago) => {
      const metodo = String(pago?.metodo || "").toLowerCase();
      const esTarjeta = metodo === "tarjeta" || Number(pago?.metodoPagoId) === 2;
      const esTransferencia = metodo === "transferencia" || Number(pago?.metodoPagoId) === 3;
      const tarjetaLegacy = /^\d{4}$/.test(String(pago?.tarjetaUltimos4 || "")) && !pago?.tarjeta && !pago?.vencimiento && !pago?.cvv;
      if (esTarjeta && !tarjetaLegacy && (!/^\d{1,16}$/.test(String(pago?.tarjeta || "")) || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(pago?.vencimiento || "")) || !/^\d{3,4}$/.test(String(pago?.cvv || "")))) {
        throw new Error("Tarjeta, vencimiento y CVV validos son obligatorios para pago con tarjeta");
      }
      if (esTransferencia && !(pago?.comprobante || pago?.referencia)) {
        throw new Error("Comprobante o referencia son obligatorios para transferencia");
      }
      return true;
    }),
  textoSeguro("cliente.nombres", "nombres"),
  textoSeguro("cliente.apellidos", "apellidos", 1),
  body("cliente.cedula").optional().matches(/^\d{10}$/).withMessage("cedula debe tener 10 digitos"),
  body("cliente.telefono").optional().matches(/^[+()\-\s\d]{7,20}$/).withMessage("telefono invalido"),
  body("cliente.email").optional().isEmail().withMessage("email de cliente invalido").normalizeEmail(),
  textoSeguro("direccion.ciudad", "ciudad"),
  textoSeguro("direccion.direccion", "direccion"),
  textoSeguro("direccion.referencia", "referencia", 3),
  body("cliente").optional().isObject().withMessage("cliente invalido"),
  body("cliente").custom((cliente) => {
    if (!cliente) return true;
    if (!cliente.nombres || !cliente.cedula || !cliente.telefono) {
      throw new Error("nombres, cedula y telefono son obligatorios para datos del cliente");
    }
    return true;
  }),
  body("direccion").optional().isObject().withMessage("direccion invalida"),
  body("direccion").custom((direccion) => {
    if (!direccion) return true;
    if (!direccion.ciudad || !direccion.direccion) {
      throw new Error("ciudad y direccion son obligatorias para datos de entrega");
    }
    return true;
  }),
  handleValidation
];
