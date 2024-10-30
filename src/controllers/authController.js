const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const transporter = require('../config/mailer');
const logger = require('../utils/logger');
const { addTokenToBlacklist } = require('../utils/tokenBlacklist');


require('dotenv').config();

const generateToken = (user) => 
    jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son obligatorios' });

  try {
    const user = await User.create({ name, email, password });
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Guardar el código y la fecha límite de expiración en la base de datos o caché
    // Enviar email
    await transporter.sendMail({
        from: '"App Urbanus" <no-reply@urbanus.com>',
        to: user.email,
        subject: 'Código de verificación de cuenta',
        text: `Su código de verificación es ${verificationCode}. Este código expira en 12 horas.`,
      });

    logger.info('Usuario registrado y correo de verificación enviado.');
    res.status(201).json({ message: 'Usuario registrado. Revise su correo electrónico para verificarlo.' });
  } catch (error) {
    logger.error(`Error al registrar usuario: ${error.message}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  // Lógica para verificar el código, la expiración y activar el email
  res.status(200).json({ message: 'Correo verificado correctamente' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    logger.error(`Error al iniciar sesión: ${error.message}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  // Agrega el token a la lista de bloqueo
  if (token) {
    addTokenToBlacklist(token);
    return res.status(200).json({ message: 'Usuario desconectado correctamente', logoutAt: new Date() });
  }

  res.status(400).json({ message: 'Token no provisto' });
};

const userInfo = async (req, res) => {
  const user = req.user;
  res.status(200).json({ user });
};

module.exports = { register, verifyEmail, login, logout, userInfo };
