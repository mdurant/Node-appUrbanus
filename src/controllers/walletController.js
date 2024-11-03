// src/controllers/walletController.js
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Crear Wallet
const createWallet = async (req, res) => {
  const user = req.user;

  if (user.role !== 'USER') {
    return res.status(403).json({ 
      code: 403,
      message: 'Solo usuarios con rol "USER" pueden crear una wallet' });
  }

  const existingWallet = await Wallet.findOne({ where: { user_id: user.id } });
  if (existingWallet) {
    return res.status(400).json({ 
      code: 400,
      message: 'El usuario ya tiene una wallet existente' });
  }

  try {
    const wallet = await Wallet.create({
      user_id: user.id,
      wallet_id: `WA-${crypto.randomBytes(8).toString('hex').match(/.{1,4}/g).join('-')}`,
      currency: 'CLP',
      balance: 0,
    });

    logger.info(`Wallet creada para usuario ID: ${user.id}`);
    res.status(201).json(wallet);
  } catch (error) {
    logger.error(`Error al crear wallet: ${error.message}`);
    res.status(500).json({ 
      code: 500,
      message: 'Error interno del servidor' });
  }
};

// Listar Wallets
const listWallets = async (req, res) => {
  const user = req.user;

  if (user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Solo usuarios con rol "ADMIN" pueden listar wallets' });
  }

  try {
    const wallets = await Wallet.findAll();
    res.status(200).json(wallets);
  } catch (error) {
    logger.error(`Error al listar wallets: ${error.message}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Agregar Dinero a la Wallet
const addFunds = async (req, res) => {
  const { amount } = req.body;
  const user = req.user;

  if (amount <= 0) {
    return res.status(400).json({ message: 'El monto debe ser positivo' });
  }

  try {
    const wallet = await Wallet.findOne({ where: { user_id: user.id } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet no encontrada' });
    }

    wallet.balance += amount;
    await wallet.save();

    const transaction = await WalletTransaction.create({
      transaction_id: crypto.randomBytes(8).toString('hex'),
      amount,
      type: 'add_funds',
      description: 'Fondos agregados',
      wallet_id: wallet.id,
      user_id: user.id,
    });

    res.status(200).json({
      message: 'Fondos agregados exitosamente',
      new_balance: wallet.balance,
      transaction,
    });
  } catch (error) {
    logger.error(`Error al agregar fondos: ${error.message}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Ver Balance
const viewBalance = async (req, res) => {
  const user = req.user;

  try {
    const wallet = await Wallet.findOne({ where: { user_id: user.id } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet no encontrada' });
    }

    res.status(200).json({
      balance: wallet.balance,
      currency: wallet.currency,
      is_blocked: wallet.is_blocked,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    });
  } catch (error) {
    logger.error(`Error al obtener balance: ${error.message}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Ver Transacciones
const viewTransactions = async (req, res) => {
  const user = req.user;

  try {
    const transactions = await WalletTransaction.findAll({ where: { user_id: user.id } });
    const transactionCount = transactions.length;

    res.status(200).json({
      code: 200,
      wallet_transaction_total: transactionCount,
      transactions: transactions.map(transaction => ({
        transaction_id: transaction.transaction_id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        createdAt: transaction.createdAt,
      })),
    });
  } catch (error) {
    logger.error(`Error al obtener transacciones: ${error.message}`);
    res.status(500).json({ 
      code: 500,
      message: 'Error interno del servidor' });
  }
}

module.exports = { createWallet, listWallets, addFunds, viewBalance, viewTransactions };
