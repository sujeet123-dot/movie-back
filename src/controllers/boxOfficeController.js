const BoxOffice = require('../models/BoxOffice');

const getChart = async (req, res, next) => {
  try {
    const entries = await BoxOffice.find({ isActive: true }).sort({ market: 1, rank: 1 });

    const india     = entries.filter((e) => e.market === 'india');
    const worldwide = entries.filter((e) => e.market === 'worldwide');

    res.json({ india, worldwide, updatedAt: entries[0]?.updatedAt || null });
  } catch (err) {
    next(err);
  }
};

const createEntry = async (req, res, next) => {
  try {
    const { rank, title, collection, unit, currency, market, change } = req.body;
    const entry = await BoxOffice.create({ rank, title, collection, unit, currency, market, change });
    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
};

const updateEntry = async (req, res, next) => {
  try {
    const entry = await BoxOffice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ entry });
  } catch (err) {
    next(err);
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    const entry = await BoxOffice.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getChart, createEntry, updateEntry, deleteEntry };
