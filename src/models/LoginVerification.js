// src/models/LoginVerification.js
const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const User = require('./User');
const moment = require('moment-timezone');

class LoginVerification extends Model {}

LoginVerification.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'expired', 'revoked', 'failed'),
    defaultValue: 'pending',
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => moment().tz('America/Santiago').add(1, 'hour').toDate(), // 🔹 Expira en 1 hora (Chile)
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return moment(this.getDataValue('createdAt'))
        .tz('America/Santiago')
        .format();
    },
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return moment(this.getDataValue('updatedAt'))
        .tz('America/Santiago')
        .format();
    },
  },
}, {
  sequelize,
  modelName: 'LoginVerification',
  tableName: 'LoginVerifications',
  timestamps: true,
});

LoginVerification.belongsTo(User, { foreignKey: 'userId' });

module.exports = LoginVerification;
