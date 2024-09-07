const express = require('express');
const router = express.Router();
const db = require('../models'); 
const CryptoJS = require('crypto-js');
require('dotenv').config();

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

const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
};

router.get('/', async (req, res) => {
  try {
    // Fetch all leadership entries
    const leaderships = await db.Leadership.findAll();

    if (!leaderships.length) {
      return res.status(404).json({
        success: false,
        message: 'No leaders found',
        statusCode: 404,
      });
    }

    // Get the base URL from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Format leadership data, including converting role to title case and handling image URLs
    const formattedLeaderships = leaderships.map((leadership) => {
      return {
        id: leadership.id,
        userId: leadership.userId,
        name: leadership.name,
        role: toTitleCase(leadership.role),  // Convert to title case
        image: `${baseUrl}${leadership.image}`,  // Prepend base URL to image path
        createdAt: leadership.createdAt,
        updatedAt: leadership.updatedAt,
        user: leadership.user,  // Include user data if required
      };
    });

    // Encryption key
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required encryption key');
    }

    // Encrypt the formatted leadership data
    const encryptedDetails = encryptData(formattedLeaderships, key);

    // Return the encrypted data in response
    return res.status(200).json({
      success: true,
      data: encryptedDetails,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error retrieving leadership data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

module.exports = router;
