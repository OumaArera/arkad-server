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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to validate data types for updates
const validateUpdateData = (userData) => {
  const { title, venue, date } = userData;

  if (title && typeof title !== 'string') {
    return { valid: false, message: 'Invalid title' };
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
  const { title, venue, date } = req.body;  // Extract data directly from req.body
  const file = req.file;

  // Validate that at least one field is present in the request
  if (!title && !venue && !date && !file) {
    return res.status(400).json({
      success: false,
      message: 'No data provided for update',
      statusCode: 400,
    });
  }

  // Validate the data (only for fields that are provided)
  const validation = validateUpdateData({ title, venue, date });
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
  if (title) updateFields.title = title;
  if (venue) updateFields.venue = venue;
  if (date) updateFields.date = date;

  // If a file is uploaded, update the image field
  if (file) {
    const imageUrl = `/public/uploads/${file.filename}`;
    updateFields.image = imageUrl;
  }

  try {
    // Update the achievement in the database
    const [updated] = await db.Activity.update(updateFields, {
      where: { id: achievementId },
    });

    if (updated) {
      return res.status(200).json({
        success: true,
        message: 'Activities updated successfully',
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
