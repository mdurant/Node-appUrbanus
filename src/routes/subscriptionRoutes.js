// src/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();

const { createSubscription, cancelSubscription, annulSubscription } = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/authMiddleware'); // tu middleware de autenticación JWT

router.post('/create', authMiddleware, createSubscription);
router.post('/cancel', authMiddleware, cancelSubscription);
router.post('/annul', authMiddleware, annulSubscription);

module.exports = router;
