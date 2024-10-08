const express = require('express');
const db = require('../models');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const authenticateToken = require("./authenticateToken");
require('dotenv').config();

const router = express.Router();

router.put('/', authenticateToken, async (req, res) => {
  const { iv, ciphertext } = req.body;

  if (!iv || !ciphertext) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data. Missing required fields',
      statusCode: 400,
    });
  }

  try {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    // Decrypt the incoming data
    const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    let decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    decryptedData = decryptedData.replace(/\0+$/, '');  // Remove trailing null bytes

    const userData = JSON.parse(decryptedData);
    const { username, password } = userData;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
        statusCode: 400,
      });
    }

    // Check if the user exists
    const user = await db.User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        statusCode: 404,
      });
    }

    const saltKey = process.env.SALTING_KEY;
    if (!saltKey) {
      throw new Error('Missing required keys');
    }

    // Salt and hash the new password
    const saltedPassword = password + saltKey;
    const hashedPassword = await bcrypt.hash(saltedPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      statusCode: 200,
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
