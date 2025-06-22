import logger from '../config/logger.js';

export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  logger.error(err.stack || err.message);
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  });
}
