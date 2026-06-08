const router = require('express').Router();
const { getPhotos, createPhoto, createPhotosBulk, updatePhoto, deletePhoto } = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, authorOrAdmin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/',           getPhotos);
router.post('/',          protect, authorOrAdmin, upload.single('image'),        createPhoto);
router.post('/bulk',      protect, authorOrAdmin, upload.array('images', 20),    createPhotosBulk);
router.put('/:id',        protect, authorOrAdmin, upload.single('image'),        updatePhoto);
router.delete('/:id',     protect, adminOnly,                                    deletePhoto);

module.exports = router;
