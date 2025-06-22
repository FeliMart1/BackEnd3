// src/middlewares/errorHandler.js
import logger from '../config/logger.js';

export default function errorHandler(err, req, res, next) {
  // Si ya tiene status (p.ej. 400, 404) lo usamos; si no, 500
  const status = err.status || 500;
  // Logueamos el stack para depuración
  logger.error(err.stack || err.message);
  // Y devolvemos JSON uniforme
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  });
}
