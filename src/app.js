// src/app.js
const express = require('express');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const offerRoutes = require('./routes/offerRoutes');
const walletRoutes = require('./routes/walletRoutes'); 

const { connectDB } = require('./config/db');
const app = express();
require('dotenv').config();

// Inicia la conexión con la base de datos
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/wallet', walletRoutes);
// Configuración de puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  logger.info(`Servidor escuchando en el puerto ${PORT}`);
});


module.exports = app;
