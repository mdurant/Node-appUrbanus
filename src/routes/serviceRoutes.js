// src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();

const {
  createService,
  listServices,
  listServicesPaginated,
  getServiceBySlug,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

const rateLimit = require('express-rate-limit');

// Configurar rate limit
const serviceRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20,            // 20 requests por minuto
  message: { 
    code: 429, 
    message: 'Demasiadas solicitudes. Por favor, inténtalo de nuevo en un minuto.'
  },
});

router.use(serviceRateLimiter);

// CRUD
router.post('/', createService);          // crear servicio
router.get('/', listServices);            // listar servicios
router.get('/paginated', listServicesPaginated); // listar servicios paginados
router.get('/:slug', getServiceBySlug);   // detalle por slug
router.put('/:slug', updateService);      // actualizar
router.delete('/:slug', deleteService);   // eliminar

module.exports = router;
