// src/middlewares/apiKeyMiddleware.js
const APIKey = require('../models/APIKey');

const apiKeyMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ code: 401, message: 'API Key requerida.' });
  }

  const keyRecord = await APIKey.findOne({ where: { key: apiKey, isActive: true } });

  if (!keyRecord) {
    return res.status(403).json({ code: 403, message: 'API Key inválida o deshabilitada.' });
  }

  req.apiKeyUser = keyRecord.userId;
  next();
};

module.exports = apiKeyMiddleware;
