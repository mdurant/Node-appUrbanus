// src/app.js
const express = require('express');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const offerRoutes = require('./routes/offerRoutes');
const walletRoutes = require('./routes/walletRoutes'); 
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const serviceRoutes = require('./routes/serviceRoutes');


const { connectDB } = require('./config/db');
const app = express();
process.loadEnvFile(); // Carga las variables de entorno

// Inicia la conexión con la base de datos
try {
  connectDB();
} catch (err) {
  logger.error('Error conectando a la BD', err);
  process.exit(1); // o maneja la recuperación
}

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/services', serviceRoutes);

// Configuración de puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  logger.info(`Servidor escuchando en el puerto ${PORT}`);
  logger.info(`Entorno de ejecución: ${process.env.NODE_ENV}`);
  logger.info(`Nombre de Base de datos conectada es: ${process.env.DB_DATABASE}`);
  logger.info(`Dialect SQL es : ${process.env.DB_DIALECT}`);
  logger.info(`Nombre de APP es : ${process.env.NAME_APP}`);
  logger.info(`URL de APP es : ${process.env.URL_APP}/api`);
  //console.log('Service es:', Service);

});


module.exports = app;
