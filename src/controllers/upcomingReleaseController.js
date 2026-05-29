const slugify = require('slugify');
const UpcomingRelease = require('../models/UpcomingRelease');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

const parseCsv = (val) => (val ? val.split(',').map((s) => s.trim()).filter(Boolean) : []);

const toSlug = (val) =>
  val
    ? val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : '';

const getMovies = async (req, res, next) => {
  try {
    const { status, search, cast, director, writer, page = 1, limit = 20 } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = { isActive: true };

    if (status === 'upcoming') filter.releaseDate = { $gt: today };
    else if (status === 'released') filter.releaseDate = { $lte: today };

    if (cast)     filter.cast     = { $elemMatch: { $regex: cast,     $options: 'i' } };
    if (director) filter.director = { $elemMatch: { $regex: director, $options: 'i' } };
    if (writer)   filter.writer   = { $elemMatch: { $regex: writer,   $options: 'i' } };

    if (search) {
      filter.$or = [
        { title:    { $regex: search, $options: 'i' } },
        { cast:     { $elemMatch: { $regex: search, $options: 'i' } } },
        { director: { $elemMatch: { $regex: search, $options: 'i' } } },
        { writer:   { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    const sortDir = status === 'upcoming' ? 1 : -1;
    const lim = parseInt(limit, 10);
    const pg  = parseInt(page, 10);

    const [releases, total] = await Promise.all([
      UpcomingRelease.find(filter)
        .sort({ releaseDate: sortDir })
        .skip((pg - 1) * lim)
        .limit(lim),
      UpcomingRelease.countDocuments(filter),
    ]);

    res.json({
      releases,
      pagination: { total, page: pg, limit: lim, pages: Math.ceil(total / lim) },
    });
  } catch (err) {
    next(err);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const release = await UpcomingRelease.findOne({ slug: req.params.slug, isActive: true });
    if (!release) return res.status(404).json({ message: 'Movie not found' });
    res.json({ release });
  } catch (err) {
    next(err);
  }
};

const createRelease = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Poster image is required' });

    const { title, slug, releaseDate, platform, articleSlug, cast, director, writer, genre } = req.body;
    const uploaded = await uploadToCloudinary(req.file.buffer);

    const finalSlug = slug
      ? toSlug(slug)
      : slugify(title, { lower: true, strict: true });

    const release = await UpcomingRelease.create({
      title,
      slug: finalSlug,
      releaseDate,
      platform: platform || 'theatre',
      poster:          uploaded.secure_url,
      posterPublicId:  uploaded.public_id,
      articleSlug:     articleSlug || '',
      cast:     parseCsv(cast),
      director: parseCsv(director),
      writer:   parseCsv(writer),
      genre:    parseCsv(genre),
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
      updates.poster         = uploaded.secure_url;
      updates.posterPublicId = uploaded.public_id;
    }

    if (updates.cast     !== undefined) updates.cast     = parseCsv(updates.cast);
    if (updates.director !== undefined) updates.director = parseCsv(updates.director);
    if (updates.writer   !== undefined) updates.writer   = parseCsv(updates.writer);
    if (updates.genre    !== undefined) updates.genre    = parseCsv(updates.genre);
    if (updates.slug)                   updates.slug     = toSlug(updates.slug);

    const updated = await UpcomingRelease.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
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

module.exports = { getMovies, getBySlug, createRelease, updateRelease, deleteRelease };
