const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateSignup, validatePasswordUpdate } = require('../middleware/validator');
const { loginRateLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginRateLimiter, authController.login);
router.post('/signup', validateSignup, authController.signup);
router.get('/me', verifyToken, authController.getMe);
router.put('/update-password', verifyToken, validatePasswordUpdate, authController.updatePassword);

module.exports = router;
