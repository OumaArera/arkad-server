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

// PUT route to update media details
router.put('/:id', authenticateToken, upload.array('images', 10), async (req, res) => {
  const mediaId = parseInt(req.params.id, 10);
  const { description } = req.body;  // Directly access description from the body
  const files = req.files;

  // Check if there's a description or files to update
  if (!description && !files) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data. Missing required fields',
      statusCode: 400,
    });
  }

  try {
    const existingMedia = await db.Media.findByPk(mediaId);

    if (!existingMedia) {
      return res.status(404).json({
        success: false,
        message: 'Media not found',
        statusCode: 404,
      });
    }

    // Prepare new image URLs
    let newMediaUrls = [];
    if (files && files.length > 0) {
      newMediaUrls = files.map(file => `/public/uploads/${file.filename}`);
    }

    // Update media in the database
    await db.Media.update({
      description,
      media: JSON.stringify(newMediaUrls)
    }, {
      where: { id: mediaId }
    });

    // Remove old images from the folder
    const oldMediaUrls = JSON.parse(existingMedia.media);
    oldMediaUrls.forEach(oldUrl => {
      const filePath = path.join(__dirname, '..', 'public', 'uploads', path.basename(oldUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Media updated successfully',
      statusCode: 200,
    });

  } catch (error) {
    console.error('Error updating media:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      statusCode: 500,
    });
  }
});

module.exports = router;
