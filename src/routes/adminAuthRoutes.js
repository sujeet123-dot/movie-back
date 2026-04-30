const router = require('express').Router();
const { body } = require('express-validator');
const { registerAdmin, updateAdminPassword } = require('../controllers/adminAuthController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  registerAdmin
);

router.put(
  '/update-password',
  protect,
  adminOnly,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  updateAdminPassword
);

module.exports = router;
