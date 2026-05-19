const slugify = require('slugify');
const Category = require('../models/Category');
const Article = require('../models/Article');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

const getCategoryWithArticles = async (req, res, next) => {
  try {
    const fullSlug = req.params.parent
      ? `${req.params.parent}/${req.params.slug}`
      : req.params.slug;
    const leafSlug = req.params.slug || fullSlug;

    // Collect all slug variants to search (e.g. 'film/bollywood' and 'bollywood').
    // This handles articles created under a simple slug before the category was
    // renamed to a hierarchical path, or vice-versa.
    const slugsToTry = [...new Set([fullSlug, leafSlug])];
    const matchingCategories = await Category.find({ slug: { $in: slugsToTry } });

    if (!matchingCategories.length) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Prefer the most-specific match as the display category
    const category =
      matchingCategories.find((c) => c.slug === fullSlug) || matchingCategories[0];

    // Query articles from ALL matching category IDs so articles assigned to
    // 'bollywood' still appear at /category/film/bollywood and vice-versa.
    const categoryIds = matchingCategories.map((c) => c._id);
    const articleFilter = {
      category: categoryIds.length > 1 ? { $in: categoryIds } : categoryIds[0],
      status: 'published',
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const [articles, total] = await Promise.all([
      Article.find(articleFilter)
        .sort('-publishedAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name avatar')
        .populate('category', 'name slug color'),
      Article.countDocuments(articleFilter),
    ]);

    res.json({ category, articles, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const slug = req.body.slug
      ? req.body.slug.toLowerCase().replace(/[^a-z0-9/]+/g, '-').replace(/^-|-$/g, '')
      : slugify(name, { lower: true, strict: true });
    const category = await Category.create({ name, slug, description, color });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const count = await Article.countDocuments({ category: req.params.id });
    if (count > 0) return res.status(400).json({ message: `Cannot delete — ${count} articles use this category` });
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, getCategoryWithArticles, createCategory, updateCategory, deleteCategory };
