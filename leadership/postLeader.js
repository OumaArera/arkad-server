const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
const authenticateToken = require("../authentication/authenticateToken");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const router = express.Router();

// Helper function to validate data types
const validateData = (userData) => {
  const { userId, name, role } = userData;

  if (!userId || typeof userId !== 'number') {
    return { valid: false, message: 'Invalid userId' };
  }

  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Invalid name' };
  }

  if (!role || typeof role !== 'string') {
    return { valid: false, message: 'Invalid role' };
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
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// POST route to create a new achievement
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { iv, ciphertext } = req.body;
  const file = req.file;

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
      throw new Error('Missing required key');
    }

    // Decrypting the data
    const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    let decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    decryptedData = decryptedData.replace(/\0+$/, '');

    const userData = JSON.parse(decryptedData);
    const { userId, name, role } = userData;

    // Validate the data
    const validation = validateData({ userId, name, role });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        statusCode: 400,
      });
    }

    const lowerCaseRole = role.toLowerCase();

    // Check for existing record with the same role
    const existingLeadership = await db.Leadership.findOne({ where: { role: lowerCaseRole } });

    if (existingLeadership) {
      return res.status(400).json({
        success: false,
        message: 'Role already exists',
        statusCode: 400,
      });
    }

    let imageUrl = null;

    if (file) {
      // Define the image URL path (relative to the public directory)
      imageUrl = `/public/uploads/${file.filename}`;
    }

    // Store data in the database with the image URL
    await db.Leadership.create({
      userId,
      image: imageUrl,
      name,
      role: lowerCaseRole,
    });

    return res.status(201).json({
      success: true,
      message: 'Leader added successfully',
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
