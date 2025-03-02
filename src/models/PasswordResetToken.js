const { Model, DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const User = require('./User');
const moment = require('moment-timezone');

class PasswordResetToken extends Model {}

PasswordResetToken.init({
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
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return moment(this.getDataValue('expiresAt')).tz('America/Santiago').format();
    },
  },
}, {
  sequelize,
  modelName: 'PasswordResetToken',
  tableName: 'PasswordResetTokens',
  timestamps: true,
});

PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = PasswordResetToken;
