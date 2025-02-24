'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WalletTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  WalletTransaction.init({
    wallet_id: DataTypes.UUID,
    currency: DataTypes.STRING,
    transaction_type: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    balance_after_transaction: DataTypes.DECIMAL,
    description: DataTypes.STRING,
    transaction_date: DataTypes.DATE,
    ip_of_transaction: DataTypes.STRING,
    transaction_browser: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'WalletTransaction',
  });
  return WalletTransaction;
};