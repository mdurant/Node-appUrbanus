const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');


const router = express.Router();


router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/verify-login', authController.verifyLogin);
router.post('/login', authController.login);
router.post('/password-reset', authController.requestPasswordReset);
router.post('/password-reset/confirm', authController.resetPassword);
router.post('/logout', authMiddleware, authController.logout);
router.get('/user-info', authMiddleware, authController.userInfo);

module.exports = router;