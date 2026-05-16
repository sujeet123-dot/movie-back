const slugify = require('slugify');
const Article = require('../models/Article');
const Category = require('../models/Category');
const APIFeatures = require('../utils/apiFeatures');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

const getArticles = async (req, res, next) => {
  try {
    // Resolve categorySlug → ObjectId so slug-based filtering works
    const query = { ...req.query };
    if (query.categorySlug) {
      const cat = await Category.findOne({ slug: query.categorySlug });
      if (cat) query.category = cat._id.toString();
      delete query.categorySlug;
    }

    const baseQuery = Article.find({ status: 'published' })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color');

    const features = new APIFeatures(baseQuery, query)
      .filter()
      .search(['title', 'excerpt', 'tags'])
      .sort()
      .paginate();

    const [articles, total] = await Promise.all([
      features.query,
      Article.countDocuments({ status: 'published' }),
    ]);

    res.json({
      articles,
      pagination: { total, page: features.page, limit: features.limit, pages: Math.ceil(total / features.limit) },
    });
  } catch (err) {
    next(err);
  }
};

const getFeaturedArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ status: 'published', isFeatured: true })
      .sort('-publishedAt')
      .limit(4)
      .populate('author', 'name avatar')
      .populate('category', 'name slug color');
    res.json({ articles });
  } catch (err) {
    next(err);
  }
};

const getArticleBySlug = async (req, res, next) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug color');

    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ article });
  } catch (err) {
    next(err);
  }
};

const getRelatedArticles = async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const related = await Article.find({
      status: 'published',
      category: article.category,
      _id: { $ne: article._id },
    })
      .sort('-publishedAt')
      .limit(4)
      .populate('author', 'name')
      .populate('category', 'name slug color');

    res.json({ articles: related });
  } catch (err) {
    next(err);
  }
};

const getMostPopular = async (req, res, next) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .sort('-views')
      .limit(8)
      .select('title slug views publishedAt')
      .populate('category', 'name slug');
    res.json({ articles });
  } catch (err) {
    next(err);
  }
};

const createArticle = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, tags, status, isFeatured, isBreaking, type, rating, readTime } = req.body;

    const slug = slugify(title, { lower: true, strict: true });
    const existing = await Article.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'An article with this title already exists' });

    if (!req.file) return res.status(400).json({ message: 'Cover image is required' });

    const uploaded = await uploadToCloudinary(req.file.buffer);

    const article = await Article.create({
      title,
      slug,
      excerpt,
      content,
      coverImage: uploaded.secure_url,
      coverImagePublicId: uploaded.public_id,
      author: req.user._id,
      category,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      status,
      isFeatured: isFeatured === 'true',
      isBreaking: isBreaking === 'true',
      type: type || 'article',
      rating: rating ? parseFloat(rating) : undefined,
      readTime: readTime ? parseInt(readTime) : 3,
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    await article.populate(['author', 'category']);
    res.status(201).json({ article });
  } catch (err) {
    next(err);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const isOwner = article.author.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (updates.tags) updates.tags = updates.tags.split(',').map((t) => t.trim());
    if (updates.isFeatured) updates.isFeatured = updates.isFeatured === 'true';
    if (updates.isBreaking) updates.isBreaking = updates.isBreaking === 'true';

    if (req.file) {
      if (article.coverImagePublicId) await cloudinary.uploader.destroy(article.coverImagePublicId);
      const uploaded = await uploadToCloudinary(req.file.buffer);
      updates.coverImage = uploaded.secure_url;
      updates.coverImagePublicId = uploaded.public_id;
    }

    if (updates.status === 'published' && article.status !== 'published') {
      updates.publishedAt = new Date();
    }

    const updated = await Article.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color');

    res.json({ article: updated });
  } catch (err) {
    next(err);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.coverImagePublicId) await cloudinary.uploader.destroy(article.coverImagePublicId);
    await article.deleteOne();

    res.json({ message: 'Article deleted' });
  } catch (err) {
    next(err);
  }
};

const getAdminArticles = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Article.find().populate('author', 'name').populate('category', 'name slug'),
      req.query
    )
      .filter()
      .search(['title'])
      .sort()
      .paginate();

    const [articles, total] = await Promise.all([features.query, Article.countDocuments()]);
    res.json({ articles, pagination: { total, page: features.page, limit: features.limit } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getArticles,
  getFeaturedArticles,
  getArticleBySlug,
  getRelatedArticles,
  getMostPopular,
  createArticle,
  updateArticle,
  deleteArticle,
  getAdminArticles,
};
