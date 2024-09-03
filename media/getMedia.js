const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Fetch all media entries and order them by id in descending order
    const mediaEntries = await db.Media.findAll({
      order: [['id', 'DESC']],
    });

    // Get the base URL from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Modify each media entry to include full image URLs
    const mediaEntriesWithFullImageUrls = mediaEntries.map(mediaEntry => {
      let mediaArray = mediaEntry.media;

      // Check if media is a string (likely a JSON string), and parse it
      if (typeof mediaArray === 'string') {
        mediaArray = JSON.parse(mediaArray);
      }

      // Ensure mediaArray is an array, if not, assign an empty array
      if (!Array.isArray(mediaArray)) {
        mediaArray = [];
      }

      return {
        ...mediaEntry.dataValues,
        media: mediaArray.map(imagePath => `${baseUrl}${imagePath}`),
      };
    });

    return res.status(200).json({
      success: true,
      data: mediaEntriesWithFullImageUrls,
      statusCode: 200,
    });

  } catch (error) {
    console.error('Error retrieving media:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the media entries',
      statusCode: 500,
    });
  }
});

module.exports = router;
