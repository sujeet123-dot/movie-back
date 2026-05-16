const router = require('express').Router();
const { getUpcoming, createRelease, updateRelease, deleteRelease } = require('../controllers/upcomingReleaseController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/',       getUpcoming);
router.post('/',      protect, adminOnly, upload.single('poster'), createRelease);
router.put('/:id',   protect, adminOnly, upload.single('poster'), updateRelease);
router.delete('/:id', protect, adminOnly, deleteRelease);

module.exports = router;
