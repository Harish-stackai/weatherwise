const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe, updatePassword, seedDemoUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please provide a valid email address').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    validate,
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    check('email', 'Please provide a valid email address').isEmail(),
    check('password', 'Password is required').exists(),
    validate,
  ],
  login
);

router.get('/me', protect, getMe);

router.put(
  '/updatepassword',
  protect,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
    validate,
  ],
  updatePassword
);

router.post('/seed', seedDemoUsers);

module.exports = router;
