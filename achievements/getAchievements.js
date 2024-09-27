const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
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

router.get('/', async (req, res) => {
  try {
    const achievements = await db.Achievement.findAll({
      order: [['id', 'DESC']],
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

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
