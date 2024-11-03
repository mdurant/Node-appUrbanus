'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WalletTransaction extends Model {

    static associate(models) {
      // define association here
    }
  }
  WalletTransaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => crypto.randomBytes(8).toString('hex'), // Genera un ID único
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wallet_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'WalletTransaction',
    tableName: 'WalletTransactions',
    timestamps: true,
  });
  return WalletTransaction;
};