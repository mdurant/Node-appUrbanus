// src/controllers/subscriptionController.js
const { v4: uuidv4 } = require('uuid');
const Subscription = require('../models/Subscription');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const WalletBalance = require('../models/WalletBalance');
const WalletTransaction = require('../models/WalletTransaction');
const logger = require('../utils/logger');

// Crear Suscripción
exports.createSubscription = async (req, res) => {
  try {
    const { planType, price, currency, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Verificar si el user tiene Wallet
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) {
      logger.error(`El usuario ${userId} no tiene Wallet creada. No se puede suscribir.`)
      return res.status(400).json({
        code: 299,
        message: 'El usuario no tiene Wallet creada. No se puede suscribir.',
      });
    }

    // Crear token de transacción
    const transactionToken = uuidv4();

    // Crear la suscripción
    const subscription = await Subscription.create({
      user_id: userId,
      plan_type: planType,
      start_date: startDate,
      end_date: endDate,
      price,
      currency,
      status: 'active',
      renewal_date: endDate, // por ejemplo
      transaction_token: transactionToken,
    });

    // Actualizar wallet con la info de suscripción
    // (ejemplo: almacenar el plan en subscription_plan, etc.)
    await wallet.update({
      subscription_plan: planType,
      last_transaction_token: transactionToken,
      last_transaction_date: new Date(),
      total_transactions: wallet.total_transactions + 1,
    });

    // Registrar la transacción en la tabla transactions
    await Transaction.create({
      wallet_id: wallet.id,
      transaction_token: transactionToken,
      transaction_type: 'subscription',
      amount: price,
      status: 'successful', // o según resultado de cobro
    });

    // Registrar en wallet_transactions (para historial detallado)
    // Suponiendo que "pagar suscripción" descuenta saldo:
    const balanceRecord = await WalletBalance.findOne({
      where: { wallet_id: wallet.id, currency },
    });

    if (!balanceRecord) {
      // Podrías crearlo si no existe
      // O retornar error si el usuario no tiene saldo en esa moneda
      await WalletBalance.create({
        wallet_id: wallet.id,
        currency,
        balance: 0,
      });
    }

    const newBalance = (Number(balanceRecord?.balance) || 0) - Number(price);

    // Actualiza el balance
    if (balanceRecord) {
      await balanceRecord.update({ balance: newBalance });
    }

    await WalletTransaction.create({
      wallet_id: wallet.id,
      currency,
      transaction_type: 'subtract', // porque pagas suscripción
      amount: price,
      balance_after_transaction: newBalance,
      description: `Suscripción al plan ${planType}`,
      transaction_date: new Date(),
      ip_of_transaction: req.ip,
      transaction_browser: req.headers['user-agent'],
    });

    return res.status(201).json({
      code: 201,
      message: 'Suscripción creada exitosamente',
      subscription,
    });
  } catch (error) {
    logger.error(`Error al crear suscripción: ${error.message}`);
    return res.status(500).json({
      code: 500,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Cancelar Suscripción
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body; // o req.params

    // Buscar la suscripción
    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, user_id: userId },
    });
    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    }

    // Obtener la wallet del usuario
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) {
      return res.status(400).json({ message: 'No existe wallet asociada' });
    }

    // Actualizar la suscripción a estado "expired"
    await subscription.update({ status: 'expired' });

    // Registrar la cancelación en el historial (transaction, wallettransaction, etc.)
    const transactionToken = uuidv4();
    await Transaction.create({
      wallet_id: wallet.id,
      transaction_token: transactionToken,
      transaction_type: 'subscription',
      amount: 0, // sin cobro
      status: 'canceled',
    });
    await WalletTransaction.create({
      wallet_id: wallet.id,
      currency: subscription.currency,
      transaction_type: 'add', // no hay movimiento de dinero, pero registramos
      amount: 0,
      balance_after_transaction: 0,
      description: `Cancelación de suscripción ${subscription.plan_type}`,
      transaction_date: new Date(),
      ip_of_transaction: req.ip,
      transaction_browser: req.headers['user-agent'],
    });

    // Opcionalmente, actualizar wallet
    await wallet.update({
      subscription_plan: null,
      last_transaction_token: transactionToken,
      last_transaction_date: new Date(),
      total_transactions: wallet.total_transactions + 1,
    });

    return res.status(200).json({ message: 'Suscripción cancelada exitosamente' });
  } catch (error) {
    logger.error(`Error al cancelar suscripción: ${error.message}`);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Anular Suscripción (restituir monto)
exports.annulSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;

    // Buscar la suscripción
    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, user_id: userId, status: 'active' },
    });
    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada o inactiva' });
    }

    // Devolver el monto a la wallet
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) {
      return res.status(400).json({ message: 'No existe wallet asociada' });
    }

    // Buscar balance de la moneda
    const balanceRecord = await WalletBalance.findOne({
      where: { wallet_id: wallet.id, currency: subscription.currency },
    });
    if (!balanceRecord) {
      return res.status(400).json({ message: 'El usuario no tiene balance en esta moneda' });
    }

    const newBalance = Number(balanceRecord.balance) + Number(subscription.price);
    await balanceRecord.update({ balance: newBalance });

    // Dejar la suscripción como "expired" o "anulada"
    await subscription.update({ status: 'expired' });

    // Registrar transacciones
    const transactionToken = uuidv4();
    await Transaction.create({
      wallet_id: wallet.id,
      transaction_token: transactionToken,
      transaction_type: 'subscription',
      amount: subscription.price,
      status: 'canceled', // o similar
    });

    await WalletTransaction.create({
      wallet_id: wallet.id,
      currency: subscription.currency,
      transaction_type: 'add',
      amount: subscription.price,
      balance_after_transaction: newBalance,
      description: `Anulación de suscripción ${subscription.plan_type}`,
      transaction_date: new Date(),
      ip_of_transaction: req.ip,
      transaction_browser: req.headers['user-agent'],
    });

    // Actualizar datos de la wallet
    await wallet.update({
      subscription_plan: null,
      last_transaction_token: transactionToken,
      last_transaction_date: new Date(),
      total_transactions: wallet.total_transactions + 1,
    });

    return res.status(200).json({ message: 'Suscripción anulada y monto devuelto a la wallet' });
  } catch (error) {
    logger.error(`Error al anular suscripción: ${error.message}`);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};
