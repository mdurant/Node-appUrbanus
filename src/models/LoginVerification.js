// src/models/LoginVerification.js
const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const User = require('./User');

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
  },
}, {
  sequelize,
  modelName: 'LoginVerification',
  tableName: 'login_verifications',
  timestamps: true,
});

LoginVerification.belongsTo(User, { foreignKey: 'userId' });

module.exports = LoginVerification;
