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
    // Fetch all achievements and order them by id in descending order
    const achievements = await db.Achievement.findAll({
      order: [['id', 'DESC']],
    });

    // Get the base URL from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Modify the achievements to include full image URLs
    const achievementsWithFullImageUrls = achievements.map(achievement => {
      return {
        ...achievement.dataValues,
        image: `${baseUrl}${achievement.image}`,
      };
    });

    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    const encryptedAchievements = encryptData(achievementsWithFullImageUrls, key);

    return res.status(200).json({
      success: true,
      data: encryptedAchievements,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error retrieving achievements:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the achievements',
      statusCode: 500,
    });
  }
});

module.exports = router;
