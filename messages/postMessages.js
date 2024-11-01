const express = require('express');
const db = require('../models');
require('dotenv').config();

const router = express.Router();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};


router.post('/', async (req, res) => {
  const { fullName, email, phoneNumber, message } = req.body;

  try {
    if (!fullName || !email || !phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid required fields',
        statusCode: 400,
      });
    };

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        statusCode: 400,
      });
    };
    const status ="unread";

    await db.Message.create({ fullName, email, phoneNumber, message, status });

    return res.status(201).json({
      message: 'Message sent successfully',
      success: true,
      statusCode: 201,
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
