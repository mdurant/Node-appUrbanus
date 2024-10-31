// src/models/User.js
const { DataTypes, UUIDV4 } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db').sequelize;

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6],
        msg: 'La contraseña debe tener al menos 6 caracteres',
      },
      isAlphanumeric: true,
    },
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USER',
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10); // Encripta la contraseña
    },
  },
});

module.exports = User;
