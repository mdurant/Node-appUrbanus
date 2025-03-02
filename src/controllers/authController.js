const User = require('../models/User');
const LoginVerification = require('../models/LoginVerification'); // Modelo de OTP
const PasswordResetToken = require('../models/PasswordResetToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const transporter = require('../config/mailer');
const logger = require('../utils/logger');
const { addTokenToBlacklist } = require('../utils/tokenBlacklist');
const moment = require('moment-timezone');
const crypto = require('crypto');

process.loadEnvFile(); // Cargar variables de entorno

// 🔹 Expresión regular para validar la contraseña (mínimo 8 caracteres, al menos una letra y un número)
const isValidPassword = (password) => {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/.test(password);
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
const OTP_EXPIRY = process.env.VERIFICATION_EXPIRY || 300; // 5 minutos (300 seg)
const MAX_ATTEMPTS = 3; // Máximo de intentos antes de bloqueo

const generateToken = (user) => 
    jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

/** Registrar usuario */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) return res.status(400).json({ code: 400, message: 'Email y contraseña son obligatorios' });

  // 🔹 Validar la contraseña
  if (!isValidPassword(password)) {
    return res.status(400).json({
      code: 400,
      message: 'La contraseña debe tener al menos 8 caracteres, una letra y un número.',
    });
  }

  try {
    const user = await User.create({ 
      name, 
      email, 
      password, 
      email_verified_at: null // Se inicializa como NULL hasta que el usuario verifique su correo
    });

    const verificationCode = generateOTP();

    // Enviar email de verificación
    await transporter.sendMail({
      from: '"APP Urbanus" <no-reply@urbanus.com>',
      to: user.email,
      subject: 'Código de verificación de Cuenta - Urbanus',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center;">
            <img src="https://yourdomain.com/logo.png" alt="Logo" style="width: 120px; margin-bottom: 20px;">
            <h2 style="color: #4CAF50; font-size: 24px; font-weight: bold;">Código de Validación</h2>
          </div>
          <p>Estimado Cliente,</p>
          <p>Te enviamos el <strong>código de validación</strong> para tu cuenta:</p>
          <div style="text-align: center; font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px; border-radius: 5px; color: #333;">
            ${verificationCode}
          </div>
          <p>Deberás ingresar este <strong>código</strong> cuando te lo soliciten y continuar con el proceso.</p>
          <br>
          <div style="border-top: 1px solid #ddd; padding-top: 10px; font-size: 12px; color: #555;">
            <p><strong>Consejos de Seguridad:</strong></p>
            <ul>
              <li>Nunca abra ni descargue archivos de remitentes desconocidos, ni facilite sus datos personales.</li>
              <li>Nunca use la opción “guardar contraseña” en las pantallas iniciales de sitios de internet.</li>
            </ul>
            <p style="font-size: 11px; color: #999;">
              Por favor agradecemos No Contestar a esta casilla. Si requiere efectuar consultas, solicitudes, corregir errores en el envío o en sus datos, contáctenos directamente en nuestro sitio <a href="https://www.urbanus.cl" style="color: #4CAF50;">www.urbanus.cl</a>.
            </p>
            <p style="font-size: 11px; color: #999;">
              Este correo electrónico fue enviado a través de un sistema automatizado por Integraltech Spa Dirección: Santiago • Santiago Chile.
            </p>
          </div>
        </div>
      </p>`
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
    if (!user) return res.status(400).json({ code: 400, message: 'Usuario no encontrado' });

    if (user.email_verified_at !== null) return res.status(400).json({ code: 400, message: 'El correo ya ha sido verificado' });

    await user.update({ email_verified_at: new Date() });

    logger.info(`Correo verificado: ${user.email}`);
    return res.status(200).json({ code: 200, message: 'Correo verificado correctamente.' });
  } catch (error) {
    logger.error(`Error al verificar email: ${error.message}`);
    return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

/** 🔹 Verificar Email (activar usuario) */
const verifyLogin = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ code: 400, message: 'Usuario no encontrado' });

    const loginAttempt = await LoginVerification.findOne({
      where: { userId: user.id, status: 'pending' },
      order: [['createdAt', 'DESC']],
    });

    if (!loginAttempt) return res.status(400).json({ code: 400, message: 'No hay OTP pendiente para este usuario' });

    const now = moment().tz('America/Santiago').toDate();
    if (now > loginAttempt.expiresAt) {
      await loginAttempt.update({ status: 'expired' });
      return res.status(400).json({ message: 'El código ha expirado. Solicite uno nuevo.' });
    }

    if (loginAttempt.code !== otp) {
      await loginAttempt.increment('attempts');
      return res.status(400).json({ code: 400,message: 'Código incorrecto. Intente nuevamente.' });
    }

    await loginAttempt.update({ status: 'verified' });

    const token = generateToken(user);
    return res.status(200).json({ code: 200, message: 'Autenticación exitosa', token });
  } catch (error) {
    logger.error(`Error al verificar OTP: ${error.message}`);
    return res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

/** 🔹 Iniciar sesión y enviar OTP */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.error(`Login failed: User not found for email ${email}`);
      return res.status(400).json({ code: 400, message: 'Credenciales incorrectas' });
    }

    if (user.email_verified_at === null) { // 🔹 Validación correcta del email verificado
      logger.error(`Login failed: Email not verified for ${email}`);
      return res.status(403).json({ code: 403, message: 'Debe verificar su correo antes de iniciar sesión.' });
    }

    // Verificar intentos previos de OTP
    const existingOTP = await LoginVerification.findOne({
      where: { 
        userId: user.id, 
        status: 'pending', 
        expiresAt: { [Op.gt]: new Date() } 
      },
    });

    if (existingOTP) {
      await existingOTP.update({ status: 'revoked' });
    }

    // Generar OTP
    const otp = generateOTP();
    const expiresAt = moment().tz('America/Santiago').add(1, 'hour').toDate();


    // Guardar OTP en la base de datos
    await LoginVerification.create({
      userId: user.id,
      code: otp,
      expiresAt: expiresAt,
      status: 'pending',
      attempts: 0,
    });

    // **Enviar correo con OTP**
    await transporter.sendMail({
      from: '"APP Urbanus" <no-reply@urbanus.com>',
      to: user.email,
      subject: 'URBANUS - Código de Verificación de Inicio de Sesión',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center;">
            <img src="https://yourdomain.com/logo.png" alt="Logo" style="width: 120px; margin-bottom: 20px;">
            <h2 style="color: #4CAF50; font-size: 24px; font-weight: bold;">Código de Validación</h2>
          </div>
          <p>Estimado Cliente,</p>
          <p>Te enviamos el <strong>código de validación</strong> para tu cuenta:</p>
          <div style="text-align: center; font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px; border-radius: 5px; color: #333;">
            ${otp}
          </div>
          <p>Deberás ingresar este <strong>código</strong> para ingresar con tu cuenta.</p>
          <br>
          <div style="border-top: 1px solid #ddd; padding-top: 10px; font-size: 12px; color: #555;">
            <p><strong>Consejos de Seguridad:</strong></p>
            <ul>
              <li>Nunca abra ni descargue archivos de remitentes desconocidos, ni facilite sus datos personales.</li>
              <li>Nunca use la opción “guardar contraseña” en las pantallas iniciales de sitios de internet.</li>
            </ul>
            <p style="font-size: 11px; color: #999;">
              Por favor agradecemos No Contestar a esta casilla. Si requiere efectuar consultas, solicitudes, corregir errores en el envío o en sus datos, contáctenos directamente en nuestro sitio <a href="https://www.urbanus.cl" style="color: #4CAF50;">www.urbanus.cl</a>.
            </p>
            <p style="font-size: 11px; color: #999;">
              Este correo electrónico fue enviado a través de un sistema automatizado por Integraltech Spa Dirección: Santiago • Santiago Chile.
            </p>
          </div>
        </div>
      `,
    });

    logger.info(`Código OTP enviado a ${user.email}`);
    res.status(200).json({ code: 200, message: 'Código de verificación enviado a su correo electrónico' });
  } catch (error) {
    logger.error(`Error al iniciar sesión: ${error.message}`);
    res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

/** 🔹 Solicitar restablecimiento de contraseña */
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ code: 400, message: 'No se encontró una cuenta con este correo electrónico.' });

    // Generar token seguro de 32 caracteres
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = moment().add(60, 'minutes').toDate(); // Expira en 60 min

    // Revocar tokens anteriores si existen
    await PasswordResetToken.destroy({ where: { userId: user.id } });

    // Guardar nuevo token
    await PasswordResetToken.create({ userId: user.id, token: resetToken, expiresAt });

    // Enviar email con enlace
    const resetLink = `${process.env.URL_APP}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: '"Urbanus" <no-reply@urbanus.com>',
      to: user.email,
      subject: 'Restablecimiento de Contraseña - Urbanus',
      html: `
        <p>Hola ${user.name},</p>
        <p>Está recibiendo este correo porque hemos recibido una solicitud de restablecimiento de contraseña para su cuenta.</p>
        <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
        <p>Este enlace de restablecimiento de contraseña caducará en 60 minutos.</p>
        <p>Si no has solicitado un restablecimiento de contraseña, no es necesario que hagas nada más.</p>
        <br>
        <p>Saludos,<br>Urbanus</p>
      `,
    });

    logger.info(`Correo de restablecimiento enviado a ${user.email}`);
    res.status(200).json({ code: 200, message: 'Correo de restablecimiento enviado.' });

  } catch (error) {
    logger.error(`Error en solicitud de restablecimiento: ${error.message}`);
    res.status(500).json({ code: 500, message: 'Error interno del servidor' });
  }
};

/** 🔹 Restablecer contraseña */
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const resetToken = await PasswordResetToken.findOne({ 
      where: { token, expiresAt: { [Op.gt]: new Date() } }
    });

    if (!resetToken) return res.status(400).json({ code: 400, message: 'Token inválido o expirado.' });

    // Buscar usuario
    const user = await User.findByPk(resetToken.userId);
    if (!user) return res.status(400).json({ code: 400, message: 'Usuario no encontrado.' });

    // 🔹 Validar la nueva contraseña
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        code: 400,
        message: 'La nueva contraseña debe tener al menos 8 caracteres, una letra y un número.',
      });
    }
    
    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword }, { validate: false });


    // Eliminar token usado
    await resetToken.destroy();

    logger.info(`Contraseña restablecida para el usuario ${user.email}`);
    res.status(200).json({ code: 200, message: 'Contraseña restablecida con éxito.' });

  } catch (error) {
    logger.error(`Error al restablecer contraseña: ${error.message}`);
    res.status(500).json({ code: 500, message: 'Error interno del servidor' });
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

// Información del usuario
const userInfo = async (req, res) => {
  res.status(200).json({ code: 200, user: req.user });
};

module.exports = { 
  register, 
  verifyEmail, 
  login, 
  verifyLogin, 
  requestPasswordReset,
  resetPassword,
  logout, 
  userInfo 
};
