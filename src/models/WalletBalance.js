// src/models/WalletBalance.js
const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db').sequelize;

class WalletBalance extends Model {}

WalletBalance.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: uuidv4,
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
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
}, {
  modelName: 'WalletBalance',
  tableName: 'wallet_balances',
  timestamps: true,
});

WalletBalance.belongsTo(Wallet, { foreignKey: 'wallet_id' });

module.exports = WalletBalance;