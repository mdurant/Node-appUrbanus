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
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    wallet_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => `WA-${crypto.randomBytes(8).toString('hex').match(/.{1,4}/g).join('-')}`, // Genera un ID único en el formato solicitado
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0, // No permite saldo negativo
      },
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'CLP',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    blocked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Wallet',
    tableName: 'Wallets',
    timestamps: true,
  });
  return Wallet;
};