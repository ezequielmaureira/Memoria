export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Recurso no encontrado" });
}

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status === 500) {
    console.error(err);
  }
  // Los errores 500 (p. ej. base de datos caída) se loguean completos pero
  // no se exponen al cliente.
  res.status(status).json({
    error: status === 500 ? "Error interno del servidor" : err.message,
  });
}
