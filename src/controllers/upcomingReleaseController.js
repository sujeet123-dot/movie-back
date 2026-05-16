const UpcomingRelease = require('../models/UpcomingRelease');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

const getUpcoming = async (req, res, next) => {
  try {
    const releases = await UpcomingRelease.find({ isActive: true }).sort({ releaseDate: 1 });
    res.json({ releases });
  } catch (err) {
    next(err);
  }
};

const createRelease = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Poster image is required' });

    const { title, releaseDate, platform, articleSlug } = req.body;
    const uploaded = await uploadToCloudinary(req.file.buffer);

    const release = await UpcomingRelease.create({
      title,
      releaseDate,
      platform: platform || 'theatre',
      poster: uploaded.secure_url,
      posterPublicId: uploaded.public_id,
      articleSlug: articleSlug || '',
    });

    res.status(201).json({ release });
  } catch (err) {
    next(err);
  }
};

const updateRelease = async (req, res, next) => {
  try {
    const release = await UpcomingRelease.findById(req.params.id);
    if (!release) return res.status(404).json({ message: 'Release not found' });

    const updates = { ...req.body };

    if (req.file) {
      if (release.posterPublicId) await cloudinary.uploader.destroy(release.posterPublicId);
      const uploaded = await uploadToCloudinary(req.file.buffer);
      updates.poster = uploaded.secure_url;
      updates.posterPublicId = uploaded.public_id;
    }

    const updated = await UpcomingRelease.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ release: updated });
  } catch (err) {
    next(err);
  }
};

const deleteRelease = async (req, res, next) => {
  try {
    const release = await UpcomingRelease.findById(req.params.id);
    if (!release) return res.status(404).json({ message: 'Release not found' });

    if (release.posterPublicId) await cloudinary.uploader.destroy(release.posterPublicId);
    await release.deleteOne();

    res.json({ message: 'Release deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUpcoming, createRelease, updateRelease, deleteRelease };
