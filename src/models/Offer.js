// src/models/Offer.js
const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db').sequelize;

class Offer extends Model {}

Offer.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      max: 100,
      min: 0,
    },
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ACTIVE', // Valor predeterminado para nuevas ofertas
    validate: {
      isIn: [['ACTIVE', 'INACTIVE']], // Solo permite ACTIVE o INACTIVE
    },
  },
}, {
  sequelize,
  modelName: 'Offer',
  tableName: 'offers',
  timestamps: true,
});

module.exports = Offer;
