const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const transporter = require('../config/mailer');
const logger = require('../utils/logger');
const { addTokenToBlacklist } = require('../utils/tokenBlacklist');


require('dotenv').config();

const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateToken = (user) => 
    jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) return res.status(400).json({ 
    code: 400,
    message: 'Email y contraseña son obligatorios' });

  try {
    const user = await User.create({ name, email, password });
    const verificationCode = generateVerificationCode();

    // Guardar el código y la fecha límite de expiración en la base de datos o caché
    // Enviar email
    await transporter.sendMail({
      from: '"App Urbanus" <no-reply@urbanus.com>',
      to: user.email,
      subject: 'Código de verificación de cuenta',
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
              Este correo electrónico fue enviado a través de MasterBase® por Urbanus Spa. Dirección: Santiago • Santiago Chile.
            </p>
          </div>
        </div>
      `,
    });

    logger.info('Usuario registrado y correo de verificación enviado.');
    res.status(201).json({ 
      code: 201,
      message: 'Usuario registrado. Revise su correo electrónico para verificarlo.'
     });
  } catch (error) {
    logger.error(`Error al registrar usuario: ${error.message}`);
    res.status(500).json({ 
      code: 500,
      message: 'Error interno del servidor' });
  }
};

const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  // Lógica para verificar el código, la expiración y activar el email
  res.status(200).json({
    code: 200,
    message: 'Correo verificado correctamente' 
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ 
        code: 400,
        message: 'Credenciales incorrectas' 
      });
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    logger.error(`Error al iniciar sesión: ${error.message}`);
    res.status(500).json({ 
      code: 500,
      message: 'Error interno del servidor' });
  }
};

const logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  // Agrega el token a la lista de bloqueo
  if (token) {
    addTokenToBlacklist(token);
    return res.status(200).json({ 
      code: 200,
      message: 'Usuario desconectado correctamente', logoutAt: new Date() });
  }

  res.status(400).json({ 
    code: 400,
    message: 'Token no provisto' 
  });
};

const userInfo = async (req, res) => {
  const user = req.user;
  res.status(200).json({ 
    code: 200,
    user 
  });
};

module.exports = { register, verifyEmail, login, logout, userInfo };
