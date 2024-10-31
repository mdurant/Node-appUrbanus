const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { isTokenBlacklisted } = require('../utils/tokenBlacklist');


require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ 
    code: 401,
    message: 'Token no provisto. Requiere inicio de sesión.' 
    });

  // Verificar si el token está en la lista de bloqueo
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ 
      code: 401, 
      message: 'Token inválido o expirado. Por favor, inicie sesión nuevamente.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({ 
        code: 401,
        message: 'Token inválido o usuario no encontrado.' });
    }

    req.user = user; // Asigna el usuario a la solicitud
    next(); // Continúa con el siguiente middleware o controlador
  } catch (error) {
    logger.error(`Error de autenticación: ${error.message}`);
    return res.status(401).json({ 
      code: 401,
      message: 'Token inválido o expirado. Por favor, inicie sesión nuevamente.' });
  }
};

module.exports = authMiddleware;