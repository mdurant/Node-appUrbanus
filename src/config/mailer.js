// src/config/mailer.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger'); // Importa el logger para registrar eventos de envío

// Configuración de transporte para Mailtrap
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "7e0af40a65ddc8",
    pass: "973ae37890e0dc"
  }
});

// Verifica la conexión al servidor SMTP
transporter.verify((error, success) => {
  if (error) {
    logger.error(`Error al conectar con el servidor de correos: ${error.message}`);
  } else {
    logger.info("Conexión al servidor de correos SMTP de Mailtrap establecida correctamente.");
  }
});

module.exports = transporter;
