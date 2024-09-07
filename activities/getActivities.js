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
    // Fetch all achievements and order them by id in descending order
    const activities = await db.Activity.findAll({
      order: [['id', 'DESC']],
    });

    // Get the base URL from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Modify the achievements to include full image URLs
    const activitiesWithFullImageUrls = activities.map(activity => {
      return {
        ...activity.dataValues,
        image: `${baseUrl}${activity.image}`,
      };
    });

    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    const encryptedActivities = encryptData(activitiesWithFullImageUrls, key);

    return res.status(200).json({
      success: true,
      data: encryptedActivities,
      statusCode: 200,
    });

  } catch (error) {
    console.error('Error retrieving activities:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the activities',
      statusCode: 500,
    });
  }
});

module.exports = router;
