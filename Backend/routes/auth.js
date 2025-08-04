// routes/auth.js
const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login',    login);

// Protected routes below this line
router.use(protect);
router.get('/me',            getMe);
router.post('/logout',       logout);
router.put('/update-password', updatePassword);

module.exports = router;
