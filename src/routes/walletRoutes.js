// src/routes/walletRoutes.js
const express = require('express');
const { createWallet, addFunds, viewBalance, viewTransactions, listWallets } = require('../controllers/walletController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createWallet); // Cambiado de `/wallet` a `/`
router.post('/add-funds', authMiddleware, addFunds); // Cambiado de `/wallet/add-funds` a `/add-funds`
router.get('/balance', authMiddleware, viewBalance); // Cambiado de `/wallet/balance` a `/balance`
router.get('/transactions', authMiddleware, viewTransactions); // Cambiado de `/wallet/transactions` a `/transactions`
router.get('/', authMiddleware, listWallets); // Cambiado de `/wallet/` a `/`

module.exports = router;
