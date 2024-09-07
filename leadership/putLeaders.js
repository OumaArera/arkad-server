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
const validateUpdateData = (leadershipData) => {
  const { name, role } = leadershipData;

  if (name && typeof name !== 'string') {
    return { valid: false, message: 'Invalid name' };
  }

  if (role && typeof role !== 'string') {
    return { valid: false, message: 'Invalid role' };
  }

  return { valid: true };
};

// PUT route to update an existing leadership entry
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const leadershipId = req.params.id;
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

    const { name, role } = decryptedData;

    // Validate the data (only for fields that are provided)
    const validation = validateUpdateData({ name, role });
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
    if (name) updateFields.name = name;
    if (role) updateFields.role = role;

    // If a file is uploaded, update the image field
    if (file) {
      const imageUrl = `/public/uploads/${file.filename}`;
      updateFields.image = imageUrl;
    }

    // Update the leadership entry in the database
    const [updated] = await db.Leadership.update(updateFields, {
      where: { id: leadershipId },
    });

    if (updated) {
      return res.status(200).json({
        success: true,
        message: 'Leadership entry updated successfully',
        statusCode: 200,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Leadership entry not found',
        statusCode: 404,
      });
    }

  } catch (error) {
    console.error('Error updating leadership entry:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      statusCode: 500,
    });
  }
});

module.exports = router;
