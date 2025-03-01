const { Model, DataTypes, UUIDV4 } = require('sequelize');
const crypto = require('crypto');
const sequelize = require('../config/db').sequelize;
const User = require('./User'); // Relación con usuarios

class APIKey extends Model {}

APIKey.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'APIKey',
  tableName: 'api_keys',
  timestamps: true,
  paranoid: true, // Habilita soft delete (deletedAt)
});

// Relación con User
APIKey.belongsTo(User, { foreignKey: 'userId' });

module.exports = APIKey;
