export function success(res, data = null, message = "Operacion exitosa", statusCode = 200) {
  return res.status(statusCode).json({
    status: "success",
    message,
    data
  });
}

export function created(res, data = null, message = "Recurso creado correctamente") {
  return res.status(201).json({
    status: "success",
    message,
    data
  });
}

export function fail(res, message = "Solicitud invalida", statusCode = 400, errors = null) {
  return res.status(statusCode).json({
    status: "error",
    message,
    errors
  });
}
