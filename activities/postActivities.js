const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const router = express.Router();

// Helper function to validate data types
const validateData = (userData) => {
  const { userId, title, venue, date } = userData;

  if (!userId || typeof parseInt(userId) !== 'number') {
    return { valid: false, message: 'Invalid userId' };
  }

  if (!title || typeof title !== 'string') {
    return { valid: false, message: 'Invalid Title' };
  }

  if (!venue || typeof venue !== 'string') {
    return { valid: false, message: 'Invalid venue' };
  }

  if (!date || isNaN(Date.parse(date))) {
    return { valid: false, message: 'Invalid date' };
  }

  return { valid: true };
};

// Configure multer for file uploads (disk storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `image_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST route to create a new activity
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { userId, title, venue, date } = req.body;
  const file = req.file;

  // Validate the data
  const validation = validateData({ userId, title, venue, date });
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
      statusCode: 400,
    });
  }

  let imageUrl = null;

  if (file) {
    // Define the image URL path (relative to the public directory)
    imageUrl = `/public/uploads/${file.filename}`;
  }

  try {
    // Store data in the database with the image URL
    await db.Activity.create({
      userId,
      image: imageUrl,
      title,
      venue,
      date,
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      statusCode: 201,
    });

  } catch (error) {
    console.error('Error creating activity:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      statusCode: 500,
    });
  }
});

module.exports = router;
