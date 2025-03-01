const User = require('../models/User');
const LoginVerification = require('../models/LoginVerification'); // Modelo de OTP
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const transporter = require('../config/mailer');
const logger = require('../utils/logger');
const { addTokenToBlacklist } = require('../utils/tokenBlacklist');

process.loadEnvFile(); // Cargar variables de entorno

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
const OTP_EXPIRY = process.env.VERIFICATION_EXPIRY || 300; // 5 minutos
const MAX_ATTEMPTS = 3; // Máximo de intentos antes de bloqueo

const generateToken = (user) => 
    jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

/** 🔹 Registrar usuario */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) return res.status(400).json({ code: 400, message: 'Email y contraseña son obligatorios' });

  try {
    const user = await User.create({ name, email, password, isVerified: false });

    // Enviar email de verificación
    await transporter.sendMail({
      from: '"APP Urbanus" <no-reply@urbanus.com>',
      to: user.email,
      subject: 'Código de verificación de Cuenta - Urbanus',
      html: `<p>Tu código de verificación es: <strong>${generateOTP()}</strong></p>`
    });

    logger.info(`Usuario registrado: ${user.email}, correo de verificación enviado.`);
    res.status(201).json({ code: 201, message: 'Usuario registrado. Verifique su correo electrónico.' });
  } catch (error) {
    logger.error(`Error al registrar usuario: ${error.message}`);
    res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

/** 🔹 Verificar Email (activar usuario) */
const verifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    if (user.isVerified) return res.status(400).json({ message: 'El correo ya ha sido verificado' });

    await user.update({ isVerified: true }); // Activar cuenta

    logger.info(`Correo verificado: ${user.email}`);
    return res.status(200).json({ message: 'Correo verificado correctamente.' });
  } catch (error) {
    logger.error(`Error al verificar email: ${error.message}`);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/** 🔹 Iniciar sesión y enviar OTP */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!User || typeof User.findOne !== 'function') {
      throw new Error('User model is not properly initialized');
    }
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ code: 400, message: 'Credenciales incorrectas' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ code: 403, message: 'Debe verificar su correo antes de iniciar sesión.' });
    }

    // Generar OTP
    const otp = generateOTP();

    // Guardar OTP en la base de datos
    await LoginVerification.create({
      userId: user.id,
      code: otp,
      expiresAt: new Date(Date.now() + OTP_EXPIRY * 1000),
    });

    // **Enviar correo con OTP antes de responder**
    await transporter.sendMail({
      from: '"APP Urbanus" <no-reply@urbanus.com>',
      to: user.email,
      subject: 'URBANUS - Código de Verificación de Inicio de Sesión',
      html: `<h2>Código de Verificación</h2><p>Tu código es: <strong>${otp}</strong></p><p>Expira en 5 minutos.</p>`,
    });

    logger.info(`Código OTP enviado a ${user.email}`);
    res.status(200).json({ code: 200, message: 'Código de verificación enviado a su correo electrónico' });
  } catch (error) {
    logger.error(`Error al iniciar sesión: ${error.message}`);
    res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

/** 🔹 Verificar OTP y generar JWT */
const verifyLogin = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const loginAttempt = await LoginVerification.findOne({
      where: { userId: user.id, status: 'pending' },
      order: [['createdAt', 'DESC']],
    });

    if (!loginAttempt) return res.status(400).json({ message: 'No hay OTP pendiente para este usuario' });

    if (new Date() > loginAttempt.expiresAt) {
      await loginAttempt.update({ status: 'expired' });
      return res.status(400).json({ message: 'El código ha expirado. Solicite uno nuevo.' });
    }

    if (loginAttempt.code !== otp) {
      await loginAttempt.increment('attempts');
      return res.status(400).json({ message: 'Código incorrecto. Intente nuevamente.' });
    }

    await loginAttempt.update({ status: 'verified' });

    const token = generateToken(user);

    return res.status(200).json({ message: 'Autenticación exitosa', token });
  } catch (error) {
    logger.error(`Error al verificar OTP: ${error.message}`);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/** 🔹 Cerrar sesión */
const logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    addTokenToBlacklist(token);
    return res.status(200).json({ code: 200, message: 'Usuario desconectado correctamente', logoutAt: new Date() });
  }

  res.status(400).json({ code: 400, message: 'Token no provisto' });
};

// información del usuario
const userInfo = async (req, res) => {
  res.status(200).json({ code: 200, user: req.user });
};

module.exports = { register, verifyEmail, login, verifyLogin, logout, userInfo };
