// src/models/Transaction.js
const { Model, DataTypes, UUIDV4 } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const Wallet = require('./Wallet');
const sequelize = require('../config/db').sequelize;

class Transaction extends Model {}

Transaction.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: uuidv4,
    primaryKey: true,
  },
  wallet_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  transaction_token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  transaction_type: {
    type: DataTypes.ENUM('subscription', 'on_demand_payment'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('successful', 'failed', 'canceled'),
    allowNull: false,
    defaultValue: 'successful',
  },
  transaction_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,            // <--- aquí debes indicar la instancia
  modelName: 'transaction',
  tableName: 'transactions',
  timestamps: true,
});

Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id' });

module.exports = Transaction;