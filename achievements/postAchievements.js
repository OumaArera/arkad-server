const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
const authenticateToken = require("../authentication/authenticateToken");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const router = express.Router();

// Helper function to validate data types
const validateData = (userData) => {
  const { userId, description, venue, date } = userData;

  if (!userId || typeof userId !== 'number') {
    return { valid: false, message: 'Invalid userId' };
  }

  if (!description || typeof description !== 'string') {
    return { valid: false, message: 'Invalid description' };
  }

  if (!venue || typeof venue !== 'string') {
    return { valid: false, message: 'Invalid venue' };
  }

  if (!date || isNaN(Date.parse(date))) {
    return { valid: false, message: 'Invalid date' };
  }

  return { valid: true };
};

router.post('/', authenticateToken, async (req, res) => {
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
      throw new Error('Missing required encryption key');
    }

    const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    let decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    decryptedData = decryptedData.replace(/\0+$/, '');

    const userData = JSON.parse(decryptedData);
    const { userId, image, description, venue, date } = userData;

    // Validate data types
    const validation = validateData({ userId, description, venue, date });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        statusCode: 400,
      });
    }
    console.log(userId);
    console.log(image);
    console.log(description);
    console.log(venue);
    console.log(date);

    // Handle image storage
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Define image filename and path
    const filename = `image_${Date.now()}.png`;
    const imagePath = path.join(__dirname, '..', 'uploads', filename);

    // Ensure the 'uploads' directory exists
    fs.mkdirSync(path.join(__dirname, '..', 'uploads'), { recursive: true });

    // Write image to the server
    fs.writeFileSync(imagePath, buffer);

    // Define image URL path
    const imageUrl = `/uploads/${filename}`;

    // Store data in the database with the image URL
    const newAchievement = await db.Achievement.create({
      userId,
      image: imageUrl, // Store the URL path instead of the absolute path
      description,
      venue,
      date,
    });

    return res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: newAchievement,
      statusCode: 201,
    });

  } catch (error) {
    console.error('Error creating achievement:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      statusCode: 500,
    });
  }
});

module.exports = router;
