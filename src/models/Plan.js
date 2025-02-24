// src/models/Plan.js
const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db').sequelize;

class Plan extends Model {}

Plan.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  plan_name: {
    type: DataTypes.STRING, // "Anual", "Semestral", "Mensual", etc.
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING, // "CLP", "USD", etc.
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Plan',
  tableName: 'Plans',
  timestamps: true,
});

module.exports = Plan;
