const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const router = express.Router();

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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

// POST route to handle media uploads
router.post('/', authenticateToken, upload.array('images', 10), async (req, res) => {
  const { userId, description } = req.body;  // Directly access userId and description
  const files = req.files;

  // Validate data
  if (!userId || !description) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid data',
      statusCode: 400,
    });
  }

  try {
    // Prepare array to store image paths
    let mediaUrls = [];

    if (files && files.length > 0) {
      mediaUrls = files.map(file => `/public/uploads/${file.filename}`);
    }

    // Store data in the database with the media paths
    await db.Media.create({
      userId,
      media: JSON.stringify(mediaUrls),
      description,
    });

    return res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      statusCode: 201,
    });

  } catch (error) {
    console.error('Error uploading media:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      statusCode: 500,
    });
  }
});

module.exports = router;
