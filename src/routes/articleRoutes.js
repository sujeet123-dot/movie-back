const router = require('express').Router();
const {
  getArticles, getFeaturedArticles, getArticleBySlug, getRelatedArticles,
  getMostPopular, createArticle, updateArticle, deleteArticle, getAdminArticles, toggleStatus, getStats,
} = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');
const { authorOrAdmin, adminOnly } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/popular', getMostPopular);
router.get('/admin', protect, adminOnly, getAdminArticles);
router.get('/stats', protect, authorOrAdmin, getStats);
router.patch('/:id/status', protect, authorOrAdmin, toggleStatus);
router.get('/:slug', getArticleBySlug);
router.get('/:slug/related', getRelatedArticles);

const articleUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'gallery',    maxCount: 10 },
]);

router.post('/', protect, authorOrAdmin, articleUpload, createArticle);
router.put('/:id', protect, authorOrAdmin, articleUpload, updateArticle);
router.delete('/:id', protect, adminOnly, deleteArticle);

module.exports = router;
