// src/utils/logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;

// Formato personalizado para los logs
const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Configuración del logger
const logger = createLogger({
  level: 'info', // Cambia el nivel según tus necesidades
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Para imprimir el stack en caso de errores
    customFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(), // Añade color para mayor legibilidad en la consola
        customFormat
      ),
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: customFormat,
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: customFormat,
    }),
  ],
});

// Configuración adicional para producción
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new transports.File({ filename: 'logs/production.log', format: customFormat })
  );
}

module.exports = logger;
