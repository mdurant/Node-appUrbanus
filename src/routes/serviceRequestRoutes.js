// src/routes/serviceRequestRoutes.js
const express = require('express');
const { createServiceRequest } = require('../controllers/serviceRequestController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint para crear un requerimiento de servicio
router.post('/service-request', authMiddleware, createServiceRequest);

module.exports = router;
