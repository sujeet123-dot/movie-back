const router = require('express').Router();
const {
  getProfile, updateProfile, changePassword, getAllUsers, updateUserRole, toggleUserStatus,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/me', protect, getProfile);
router.put('/me', protect, upload.single('avatar'), updateProfile);
router.put('/me/password', protect, changePassword);

router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.put('/:id/status', protect, adminOnly, toggleUserStatus);

module.exports = router;
