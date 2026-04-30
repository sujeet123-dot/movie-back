const router = require('express').Router();
const {
  getArticles, getFeaturedArticles, getArticleBySlug, getRelatedArticles,
  getMostPopular, createArticle, updateArticle, deleteArticle, getAdminArticles,
} = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');
const { authorOrAdmin, adminOnly } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/popular', getMostPopular);
router.get('/admin', protect, adminOnly, getAdminArticles);
router.get('/:slug', getArticleBySlug);
router.get('/:slug/related', getRelatedArticles);

router.post('/', protect, authorOrAdmin, upload.single('coverImage'), createArticle);
router.put('/:id', protect, authorOrAdmin, upload.single('coverImage'), updateArticle);
router.delete('/:id', protect, adminOnly, deleteArticle);

module.exports = router;
