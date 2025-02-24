// src/models/WalletTransaction.js
const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const Wallet = require('./Wallet');
const crypto = require('crypto');

class WalletTransaction extends Model {}

WalletTransaction.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  wallet_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  currency: {
    type: DataTypes.ENUM('CLP', 'USD'),
    allowNull: false,
  },
  transaction_type: {
    type: DataTypes.ENUM('add', 'subtract'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  balance_after_transaction: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transaction_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ip_of_transaction: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transaction_browser: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'WalletTransaction',
  tableName: 'wallet_transactions',
  timestamps: true,
});

WalletTransaction.belongsTo(Wallet, { foreignKey: 'wallet_id' });

module.exports = WalletTransaction;
