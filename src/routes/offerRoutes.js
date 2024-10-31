// src/routes/offerRoutes.js
const express = require('express');
const { createOffer, listOffers, updateOffer, deleteOffer } = require('../controllers/offerController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

// Ruta para listar todas las ofertas (accesible a todos)
router.get('/offers', listOffers);

// Rutas protegidas por autenticación y permisos de administrador
router.post('/offers', authMiddleware, adminMiddleware, createOffer);
router.put('/offers/:id', authMiddleware, adminMiddleware, updateOffer);
router.delete('/offers/:id', authMiddleware, adminMiddleware, deleteOffer);


module.exports = router;
