const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();

const router = express.Router();

const encryptData = (data, key) => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Utf8.parse(key), {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    ciphertext: encrypted.toString(),
  };
};

router.get('/', authenticateToken, async (req, res) => {
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

    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    const encryptedMedia = encryptData(mediaEntriesWithFullImageUrls, key);

    return res.status(200).json({
      success: true,
      data: encryptedMedia,
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
