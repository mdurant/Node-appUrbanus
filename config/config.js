require('dotenv').config(); // Cargar las variables de entorno

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'mdurant',
    password: process.env.DB_PASSWORD || '1q2w3e4r',
    database: process.env.DB_DATABASE || 'apidevurbanus',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
  },
  test: {
    username: process.env.DB_USERNAME || 'mdurant',
    password: process.env.DB_PASSWORD || '1q2w3e4r',
    database: process.env.DB_DATABASE || 'apidevurbanus',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
  },
  production: {
    username: process.env.DB_USERNAME || 'mdurant',
    password: process.env.DB_PASSWORD || '1q2w3e4r',
    database: process.env.DB_DATABASE || 'apidevurbanus',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
  },
};
