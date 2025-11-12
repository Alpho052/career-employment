/*const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, getProfile, devVerify } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/verify-email', verifyEmail);
router.post('/dev-verify', devVerify); // Development verification bypass

// Protected routes
router.get('/profile', authenticate, getProfile);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;*/
const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// ===== Public Routes =====
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// ===== Protected Routes =====
// Example of how to add this later if you add a getProfile controller
// router.get('/profile', authenticate, getProfile);

// ===== Test Route =====
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

