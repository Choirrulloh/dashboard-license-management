const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest } = require('../middleware/auth');

// Web routes
router.get('/login', isGuest, authController.showLoginPage);
router.get('/register', isGuest, authController.showRegisterPage);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
