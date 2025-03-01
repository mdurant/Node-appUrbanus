'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class APIKey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  APIKey.init({
    key: DataTypes.STRING,
    userId: DataTypes.UUID,
    expiresAt: DataTypes.DATE,
    isActive: DataTypes.BOOLEAN,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'APIKey',
  });
  return APIKey;
};