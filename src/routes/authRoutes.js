const express = require('express');
const { register, verifyEmail, login, logout, userInfo } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');


const router = express.Router();


router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/user-info', authMiddleware, userInfo);

module.exports = router;