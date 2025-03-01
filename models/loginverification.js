'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoginVerification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LoginVerification.init({
    userId: DataTypes.UUID,
    code: DataTypes.STRING,
    status: DataTypes.STRING,
    attempts: DataTypes.INTEGER,
    expiresAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'LoginVerification',
    tableName: 'LoginVerifications',
  });
  return LoginVerification;
};