const APIKey = require('../models/APIKey');
const User = require('../models/User');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Función para generar un API Key aleatorio (64 caracteres)
const generateAPIKey = () => crypto.randomBytes(32).toString('hex');

// Crear una nueva API Key para un usuario autenticado
exports.createAPIKey = async (req, res) => {
  try {
    const { description, expiresAt } = req.body;
    const userId = req.user.id; // Usuario autenticado

    const apiKey = await APIKey.create({
      key: generateAPIKey(),
      userId,
      expiresAt,
      description,
    });

    return res.status(201).json({
        code: 201,
        message: 'API Key generada exitosamente.',
        apiKey,
    });
  } catch (error) {
    logger.error(`Error al generar API Key: ${error.message}`);
    return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

// Listar API Keys del usuario autenticado
exports.listAPIKeys = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Leer parámetros opcionales de paginación
      const page = parseInt(req.query.page, 10) || 1;  // Página por defecto: 1
      const limit = parseInt(req.query.limit, 10) || 10; // Límite de API Keys por página
      const offset = (page - 1) * limit;
  
      // Obtener total de API Keys y lista paginada
      const { count, rows: apiKeys } = await APIKey.findAndCountAll({
        where: { userId },
        limit,
        offset,
        order: [['createdAt', 'DESC']], // Ordenar por fecha de creación más reciente
      });
  
      return res.status(200).json({
        total: count,            // Total de API Keys registradas
        totalPages: Math.ceil(count / limit),  // Total de páginas disponibles
        page,                    // Página actual
        limit,                   // Cantidad de API Keys por página
        apiKeys,                  // Listado de API Keys
      });
    } catch (error) {
      logger.error(`Error al listar API Keys: ${error.message}`);
      return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
    }
  };

// Revocar una API Key
exports.revokeAPIKey = async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await APIKey.findOne({ where: { id, userId: req.user.id } });

    if (!apiKey) {
      return res.status(404).json({ code: 404, message: 'API Key no encontrada.' });
    }

    await apiKey.destroy(); // Soft delete
    return res.status(200).json({ code: 200, message: 'API Key revocada correctamente.' });
  } catch (error) {
    logger.error(`Error al revocar API Key: ${error.message}`);
    return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};
