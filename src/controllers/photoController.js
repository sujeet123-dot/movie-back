const Photo = require('../models/Photo');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

const getPhotos = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.album) filter.album = req.query.album;

    const limit = parseInt(req.query.limit) || 12;
    const photos = await Photo.find(filter).sort({ createdAt: -1 }).limit(limit);

    res.json({ photos });
  } catch (err) {
    next(err);
  }
};

const createPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const { title, album, caption } = req.body;
    const uploaded = await uploadToCloudinary(req.file.buffer);

    const photo = await Photo.create({
      title,
      image: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
      album: album || 'events',
      caption: caption || '',
    });

    res.status(201).json({ photo });
  } catch (err) {
    next(err);
  }
};

const updatePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    const updates = { ...req.body };

    if (req.file) {
      if (photo.imagePublicId) await cloudinary.uploader.destroy(photo.imagePublicId);
      const uploaded = await uploadToCloudinary(req.file.buffer);
      updates.image = uploaded.secure_url;
      updates.imagePublicId = uploaded.public_id;
    }

    const updated = await Photo.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    });

    res.json({ photo: updated });
  } catch (err) {
    next(err);
  }
};

const deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    if (photo.imagePublicId) await cloudinary.uploader.destroy(photo.imagePublicId);
    await photo.deleteOne();

    res.json({ message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPhotos, createPhoto, updatePhoto, deletePhoto };
