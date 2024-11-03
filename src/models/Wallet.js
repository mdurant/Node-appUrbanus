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
  wallet_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => `WA-${crypto.randomBytes(8).toString('hex').match(/.{1,4}/g).join('-')}`, // Genera un ID único en el formato solicitado
  },
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0, // No permite saldo negativo
    },
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'CLP', // Solo permite CLP como moneda inicialmente
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  is_blocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // La wallet está activa por defecto
  },
  blocked_at: {
    type: DataTypes.DATE,
    allowNull: true, // Fecha de bloqueo, nula si la wallet está activa
  },
}, {
  sequelize,
  modelName: 'Wallet',
  tableName: 'wallets',
  timestamps: true,
});

module.exports = Wallet;
