const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    title:          { type: String, required: true, trim: true },
    image:          { type: String, required: true },
    imagePublicId:  { type: String },
    album: {
      type: String,
      enum: ['events', 'red-carpet', 'candid', 'promotions', 'other'],
      default: 'events',
    },
    caption:    { type: String, default: '' },
    focalPoint: { type: String, default: 'center' },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

photoSchema.index({ isActive: 1, album: 1, createdAt: -1 });

module.exports = mongoose.model('Photo', photoSchema);
