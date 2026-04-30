const Comment = require('../models/Comment');
const Article = require('../models/Article');

const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId, isApproved: true })
      .sort('-createdAt')
      .populate('user', 'name avatar');
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const comment = await Comment.create({
      article: req.params.articleId,
      user: req.user._id,
      body: req.body.body,
    });

    await comment.populate('user', 'name avatar');
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

const approveComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ comment });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

const getPendingComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ isApproved: false })
      .sort('-createdAt')
      .populate('user', 'name')
      .populate('article', 'title slug');
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, addComment, approveComment, deleteComment, getPendingComments };
