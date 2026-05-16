const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    coverImagePublicId: { type: String },
    coverFocalPoint: { type: String, default: 'center' },
    gallery: [{ url: { type: String }, publicId: { type: String } }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    type: { type: String, enum: ['article', 'review', 'video'], default: 'article' },
    rating: { type: Number, min: 0, max: 5 },
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 3 },
    publishedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

articleSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'article',
});

articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ tags: 1 });

module.exports = mongoose.model('Article', articleSchema);
