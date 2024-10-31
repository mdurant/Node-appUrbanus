// src/middlewares/adminMiddleware.js
const logger = require('../utils/logger');

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    logger.warn(`Usuario con ID ${req.user.id} intentó acceder sin permisos de administrador.`);
    return res.status(403).json({ message: 'No tiene permisos para realizar esta acción.' });
  }
  next();
};

module.exports = adminMiddleware;
