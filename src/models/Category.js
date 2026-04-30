const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#e11d48' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
