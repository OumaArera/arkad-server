const express = require('express');
const db = require('../models');  
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { iv, ciphertext } = req.body;

  if (!iv || !ciphertext) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data. Missing required fields',
      statusCode: 400
    });
  }

  try {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    let decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    decryptedData = decryptedData.replace(/\0+$/, '');

    const userData = JSON.parse(decryptedData);
    const { username, password } = userData;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username or password is incorrect',
        statusCode: 400
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Username or password is incorrect',
        statusCode: 400
      });
    }

    const user = await db.User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username or password is incorrect',
        statusCode: 401
      });
    }

    const saltKey = process.env.SALTING_KEY;
    if (!saltKey) {
      throw new Error('Missing required keys');
    }

    const saltedPassword = password + saltKey;
    const isPasswordValid = await bcrypt.compare(saltedPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username or password is incorrect',
        statusCode: 401
      });
    }
    const name = `${user.firstName} ${user.lastName}`;

    const token = jwt.sign({ id: user.id, name: name, role: user.role, username: user.username }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    return res.status(200).json({
      accessToken: token,
      success: true,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error signing in user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500
    });
  }
});

module.exports = router;
