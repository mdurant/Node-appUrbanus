// src/app.js
const express = require('express');
const logger = require('./utils/logger');
const routes = require('./routes'); 
const authRoutes = require('./routes/authRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const offerRoutes = require('./routes/offerRoutes');

const { connectDB } = require('./config/db');
const app = express();
require('dotenv').config();


// Inicia la conexión con la base de datos
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api', serviceRequestRoutes);
app.use('/api', offerRoutes); // Agrega el router al path /offerRoutes


// Configuración de puerto
const PORT = 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  logger.info(`Servidor escuchando en el puerto ${PORT}`);
});
