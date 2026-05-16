const router = require('express').Router();
const { getChart, createEntry, updateEntry, deleteEntry } = require('../controllers/boxOfficeController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getChart);
router.post('/',     protect, adminOnly, createEntry);
router.put('/:id',  protect, adminOnly, updateEntry);
router.delete('/:id', protect, adminOnly, deleteEntry);

module.exports = router;
