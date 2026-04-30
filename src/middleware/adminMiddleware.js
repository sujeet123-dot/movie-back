const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const authorOrAdmin = (req, res, next) => {
  if (!['admin', 'author'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Author or admin access required' });
  }
  next();
};

module.exports = { adminOnly, authorOrAdmin };
