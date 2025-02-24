// src/models/Wallet.js

const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const crypto = require('crypto');

class Wallet extends Model {}

Wallet.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  // Identificador único legible para la wallet (puedes ajustarlo a tu gusto)
  wallet_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () =>
      `WA-${crypto.randomBytes(8).toString('hex').match(/.{1,4}/g).join('-')}`,
  },
  // ID del usuario dueño de la wallet
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // Plan de suscripción que tiene asociado el usuario (si lo hay)
  subscription_plan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Último token de transacción usado (ej. para suscripciones o pagos)
  last_transaction_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Fecha en la que se hizo la última transacción
  last_transaction_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Cantidad total de transacciones registradas en esta wallet
  total_transactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Estado de la wallet (activa o bloqueada)
  is_blocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  // Fecha de bloqueo (nula si la wallet está activa)
  blocked_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Wallet',
  tableName: 'wallets',
  timestamps: true,
});

module.exports = Wallet;
