const router = require('express').Router();
const {
  getComments, addComment, approveComment, deleteComment, getPendingComments,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/pending', protect, adminOnly, getPendingComments);
router.get('/:articleId', getComments);
router.post('/:articleId', protect, addComment);
router.put('/:id/approve', protect, adminOnly, approveComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
