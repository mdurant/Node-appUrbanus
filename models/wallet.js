'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Wallet.init({
    user_id: DataTypes.UUID,
    subscription_plan: DataTypes.STRING,
    last_transaction_token: DataTypes.STRING,
    last_transaction_date: DataTypes.DATE,
    total_transactions: DataTypes.INTEGER,
    is_blocked: DataTypes.BOOLEAN,
    blocked_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Wallet',
  });
  return Wallet;
};