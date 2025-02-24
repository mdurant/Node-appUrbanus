// src/models/Subscription.js
const { Model, DataTypes, UUIDV4 } = require('sequelize');
const User = require('./User');
const Plan = require('./Plan');
const sequelize = require('../config/db').sequelize;

class Subscription extends Model {}

Subscription.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  plan_type: {
    type: DataTypes.STRING, // Podrías enlazarlo con Plan o almacenar el nombre del plan
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING, // "CLP", "USD"
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'expired'),
    defaultValue: 'active',
  },
  renewal_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  transaction_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
}, {
  sequelize,
  modelName: 'Subscription',
  tableName: 'Subscriptions',
  timestamps: true,
});

Subscription.belongsTo(User, { foreignKey: 'user_id' });
Subscription.belongsTo(Plan, { foreignKey: 'plan_type', targetKey: 'plan_name' });

module.exports = Subscription;
