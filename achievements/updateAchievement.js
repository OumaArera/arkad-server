const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to validate data types for updates
const validateUpdateData = (userData) => {
  const { description, venue, date } = userData;

  if (description && typeof description !== 'string') {
    return { valid: false, message: 'Invalid description' };
  }

  if (venue && typeof venue !== 'string') {
    return { valid: false, message: 'Invalid venue' };
  }

  if (date && isNaN(Date.parse(date))) {
    return { valid: false, message: 'Invalid date' };
  }

  return { valid: true };
};

// PUT route to update an existing achievement
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const achievementId = req.params.id;
  const { iv, ciphertext } = req.body;
  const file = req.file;

  // Validate that at least one field is present in the request
  if (!iv && !ciphertext && !file) {
    return res.status(400).json({
      success: false,
      message: 'No data provided for update',
      statusCode: 400,
    });
  }

  try {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required encryption key');
    }

    // Decrypting the data if available
    let decryptedData = {};
    if (ciphertext && iv) {
      const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Hex.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      });

      let decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
      decrypted = decrypted.replace(/\0+$/, '');
      decryptedData = JSON.parse(decrypted);
    }

    const { description, venue, date } = decryptedData;

    // Validate the data (only for fields that are provided)
    const validation = validateUpdateData({ description, venue, date });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        statusCode: 400,
      });
    }

    // Prepare the update object
    const updateFields = {};

    // Add fields to the update object if they are present in the request
    if (description) updateFields.description = description;
    if (venue) updateFields.venue = venue;
    if (date) updateFields.date = date;

    // If a file is uploaded, update the image field
    if (file) {
      const imageUrl = `/public/uploads/${file.filename}`;
      updateFields.image = imageUrl;

      // Optionally, you can delete the old image file here if needed
      // const oldImage = ...; // Get the old image path from the database
      // fs.unlinkSync(path.join(__dirname, '..', oldImage));
    }

    // Update the achievement in the database
    const [updated] = await db.Achievement.update(updateFields, {
      where: { id: achievementId },
    });

    if (updated) {
      return res.status(200).json({
        success: true,
        message: 'Achievement updated successfully',
        statusCode: 200,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found',
        statusCode: 404,
      });
    }

  } catch (error) {
    console.error('Error updating achievement:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      statusCode: 500,
    });
  }
});

module.exports = router;
