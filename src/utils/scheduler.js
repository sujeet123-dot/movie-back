const Article = require('../models/Article');

async function publishScheduled() {
  try {
    const result = await Article.updateMany(
      { status: 'scheduled', scheduledAt: { $lte: new Date() } },
      { $set: { status: 'published', publishedAt: new Date() } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[scheduler] Published ${result.modifiedCount} scheduled article(s)`);
    }
  } catch (err) {
    console.error('[scheduler] Error publishing scheduled articles:', err.message);
  }
}

function startScheduler() {
  publishScheduled();
  setInterval(publishScheduled, 60 * 1000);
}

module.exports = { startScheduler };
