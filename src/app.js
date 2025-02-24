// src/app.js
const express = require('express');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const offerRoutes = require('./routes/offerRoutes');
const walletRoutes = require('./routes/walletRoutes'); 
//Certificate
const https = require('https');
const fs = require('fs');
const path = require('path');

// Cargar llaves y certificados
const privateKey = fs.readFileSync(path.resolve(__dirname, 'certs/server.key'), 'utf8');
const certificate = fs.readFileSync(path.resolve(__dirname, 'certs/server.crt'), 'utf8');
const caCertificate = fs.readFileSync(path.resolve(__dirname, 'certs/ca.crt'), 'utf8');

// Opciones para mTLS
const options = {
  key: privateKey,
  cert: certificate,
  ca: [caCertificate],  // La CA que firmó clientes
  requestCert: true,    // Solicitar certificado al cliente
  rejectUnauthorized: true // Rechazar conexiones si el cliente no envía un certificado válido
};

const { connectDB } = require('./config/db');
const app = express();
process.loadEnvFile();

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
const PORT = process.env.PORT || 3443;

// Levantar servidor HTTPS con las opciones mTLS
https.createServer(options, app).listen(PORT, () => {
  logger.info('Servidor mTLS escuchando en https://localhost:3443');
});


module.exports = app;
