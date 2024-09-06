const express = require('express');
const authenticateToken = require("../authentication/authenticateToken");
const CryptoJS = require('crypto-js');
require('dotenv').config();
const db = require('../models');

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
    const allMembers = await db.Member.findAll({
      where: { status: 'approved' },
      order: [['id', 'ASC']], 
    });

    if (allMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No members found',
        statusCode: 404,
      });
    }

    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    const encryptedData = encryptData(allMembers, key);

    return res.status(200).json({
      success: true,
      data: encryptedData,
      statusCode: 200,
    });

  } catch (error) {
    console.error('Error retrieving pending members:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving pending members',
      statusCode: 500,
    });
  }
});

module.exports = router;
