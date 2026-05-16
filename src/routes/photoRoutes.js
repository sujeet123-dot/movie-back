const router = require('express').Router();
const { getPhotos, createPhoto, updatePhoto, deletePhoto } = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/',        getPhotos);
router.post('/',       protect, adminOnly, upload.single('image'), createPhoto);
router.put('/:id',    protect, adminOnly, upload.single('image'), updatePhoto);
router.delete('/:id', protect, adminOnly, deletePhoto);

module.exports = router;
