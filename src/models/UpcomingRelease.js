const mongoose = require('mongoose');

const upcomingReleaseSchema = new mongoose.Schema(
  {
    title:          { type: String, required: true, trim: true },
    releaseDate:    { type: Date, required: true },
    platform:       {
      type: String,
      enum: ['theatre', 'netflix', 'prime', 'hotstar', 'disney', 'zee5', 'sonyliv', 'ott'],
      default: 'theatre',
    },
    poster:         { type: String, required: true },
    posterPublicId: { type: String },
    articleSlug:    { type: String, default: '' },
    isActive:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

upcomingReleaseSchema.index({ isActive: 1, releaseDate: 1 });

module.exports = mongoose.model('UpcomingRelease', upcomingReleaseSchema);
