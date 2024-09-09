const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const router = express.Router();

// Helper function to encrypt data
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

router.get('/:id', async (req, res) => {
  const { id } = req.params;  // Get the achievement ID from the request params
  try {
    // Fetch a single achievement by its ID
    const achievement = await db.Achievement.findOne({ where: { id } });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found',
        statusCode: 404,
      });
    }

    // Get the base URL from the request to build the full image URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Add the full URL for the image
    const achievementWithFullImageUrl = {
      ...achievement.dataValues,
      image: `${baseUrl}${achievement.image}`,  // Attach the full image URL
    };

    // Get the encryption key from the environment variables
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required encryption key');
    }

    // Encrypt the achievement data
    const encryptedAchievement = encryptData(achievementWithFullImageUrl, key);

    // Return the encrypted data
    return res.status(200).json({
      success: true,
      data: encryptedAchievement,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error retrieving the achievement:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the achievement',
      statusCode: 500,
    });
  }
});

module.exports = router;
