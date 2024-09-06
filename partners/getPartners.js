const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");
const { Op } = require('sequelize');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const router = express.Router();

const encryptData = (data, key) => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Utf8.parse(key), {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    ciphertext: encrypted.toString(),
  };
};

// Helper function to convert to title case
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Endpoint to retrieve partners within a specific date range (YYYY-MM-DD format)
router.get('/', authenticateToken, async (req, res) => {
  const { start, end } = req.params;

  // Validate the existence of start and end date
  if (!start || !end) {
    return res.status(400).json({
      success: false,
      message: 'Missing start or end date',
      statusCode: 400,
    });
  }

  // Convert the start and end dates into Date objects
  const startDate = new Date(start); 
  const endDate = new Date(end);

  // Validate that the provided dates are in a valid format
  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Please use "YYYY-MM-DD" format for start and end',
      statusCode: 400,
    });
  }

  // Adjust endDate to include the entire last day of the given period
  endDate.setHours(23, 59, 59, 999);

  try {
    // Query the database to retrieve partners within the date range
    const partners = await db.Partner.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    if (partners.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No partners found in the given date range',
        statusCode: 404,
      });
    }

    // Convert organizationName to title case before sending the response
    const partnersWithTitleCase = partners.map((partner) => ({
      ...partner.toJSON(),
      organizationName: toTitleCase(partner.organizationName),
    }));

    // Encrypt the data before sending it
    const key = process.env.ENCRYPTION_KEY;
    if (!key) throw new Error('Missing required keys');
    
    const encryptedPartners = encryptData(partnersWithTitleCase, key);

    return res.status(200).json({
      success: true,
      data: encryptedPartners,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error retrieving partners:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

module.exports = router;
