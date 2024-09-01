const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();

const router = express.Router();

// Utility function to encrypt data
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
    const unreadMessages = await db.Message.findAll({
      where: { status: 'unread' },
    });

    if (!unreadMessages.length) {
      return res.status(404).json({
        success: false,
        message: 'No unread messages found',
        statusCode: 404,
      });
    }

    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    const encryptedMessages = encryptData(unreadMessages, key);

    return res.status(200).json({
      success: true,
      message: 'Unread messages retrieved successfully',
      statusCode: 200,
      data: encryptedMessages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

module.exports = router;
