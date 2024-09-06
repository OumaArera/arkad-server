const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const router = express.Router();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

router.post('/', async (req, res) => {
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
      throw new Error('Missing required keys');
    }

    const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    let decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    decryptedData = decryptedData.replace(/\0+$/, '');

    const userData = JSON.parse(decryptedData);
    let { organizationName, email, contactNumber, organizationType, website, location, reasonForPartnership } = userData;

    // Ensure all required fields are present
    if (!organizationName || !email || !contactNumber || !organizationType || !website || !location || !reasonForPartnership) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid required fields',
        statusCode: 400,
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        statusCode: 400,
      });
    }
    const orgNameLowerCase = organizationName.toLowerCase();
    const existingPartner = await db.Partner.findOne({
      where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('organizationName')), orgNameLowerCase)
    });

    if (existingPartner) {
      return res.status(409).json({
        success: false,
        message: 'An organization with this name already exists.',
        statusCode: 409,
      });
    }
    
    await db.Partner.create({ 
      organizationName: orgNameLowerCase, 
      email, 
      contactNumber, 
      organizationType, 
      website, 
      location, 
      reasonForPartnership 
    });

    return res.status(201).json({
      message: 'Request sent successfully',
      success: true,
      statusCode: 201,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

module.exports = router;
