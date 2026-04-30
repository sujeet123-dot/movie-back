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
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const [articles, total] = await Promise.all([
      Article.find({ category: category._id, status: 'published' })
        .sort('-publishedAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name avatar')
        .populate('category', 'name slug color'),
      Article.countDocuments({ category: category._id, status: 'published' }),
    ]);

    res.json({ category, articles, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
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
