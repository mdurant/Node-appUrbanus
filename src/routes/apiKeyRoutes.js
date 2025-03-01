const express = require('express');
const router = express.Router();
const { createAPIKey, listAPIKeys, revokeAPIKey } = require('../controllers/apiKeyController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware); // Solo usuarios autenticados pueden gestionar API Keys

router.post('/', createAPIKey);  // Crear una API Key
router.get('/', listAPIKeys);    // Listar API Keys del usuario
router.delete('/:id', revokeAPIKey); // Revocar una API Key

module.exports = router;
// Compare this snippet from src/controllers/userController.js: