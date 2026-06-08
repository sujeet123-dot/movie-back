require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const Category = require('./src/models/Category');
const { startScheduler } = require('./src/utils/scheduler');

const PORT = process.env.PORT || 5000;

const DEFAULT_CATEGORIES = [
  { name: 'Film',     slug: 'film',     description: 'Movie news, reviews and features',        color: '#2563eb' },
  { name: 'TV',       slug: 'tv',       description: 'Television news and reviews',              color: '#9333ea' },
  { name: 'Business', slug: 'business', description: 'Entertainment industry business news',     color: '#16a34a' },
  { name: 'Awards',   slug: 'awards',   description: 'Awards season coverage',                   color: '#ca8a04' },
];

async function seedCategories() {
  const count = await Category.countDocuments();
  if (count > 0) return;
  await Category.insertMany(DEFAULT_CATEGORIES);
  console.log('Default categories seeded');
}

connectDB().then(async () => {
  await seedCategories();
  startScheduler();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
