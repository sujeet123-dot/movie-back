const mongoose = require('mongoose');

const boxOfficeSchema = new mongoose.Schema(
  {
    rank:       { type: Number, required: true, min: 1, max: 20 },
    title:      { type: String, required: true, trim: true },
    collection: { type: Number, required: true, min: 0 },
    unit:       { type: String, enum: ['Cr', 'M', 'B'], default: 'Cr' },
    currency:   { type: String, enum: ['₹', '$', '€', '£'], default: '₹' },
    market:     { type: String, enum: ['india', 'worldwide'], required: true },
    change:     { type: String, enum: ['up', 'down', 'same'], default: 'same' },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

boxOfficeSchema.index({ market: 1, isActive: 1, rank: 1 });

module.exports = mongoose.model('BoxOffice', boxOfficeSchema);
