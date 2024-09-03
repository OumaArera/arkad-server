const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const router = express.Router();

// Utility function to validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Utility function to validate phone number format
const validatePhoneNumber = (phoneNumber) => {
  const re = /^(\+254|254|0)[7]\d{8}$/;
  return re.test(String(phoneNumber));
};

// Function to generate member number
const generateMemberNumber = async () => {
  const year = new Date().getFullYear();
  
  // Find the highest existing member number for the current year
  const lastMember = await db.Member.findOne({
    where: { memberNumber: { [db.Sequelize.Op.like]: `A-%-${year}` } },
    order: [['id', 'DESC']],
  });

  // Determine the sequence number
  let sequence = lastMember ? parseInt(lastMember.memberNumber.split('-')[1]) + 1 : 1;
  sequence = sequence.toString().padStart(4, '0'); // Ensure the sequence is 4 digits

  // Generate the new member number
  const memberNumber = `A-${sequence}-${year}`;

  return memberNumber;
};

router.post("/", async (req, res) => {
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
    const { firstName, middleName, lastName, email, phoneNumber, gender, location, age, nationality, reasonForJoining } = userData;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        statusCode: 400,
      });
    }

    // Validate phone number
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
        statusCode: 400,
      });
    }

    // Validate age
    const ageNumber = Number(age);
    if (isNaN(ageNumber) || ageNumber < 5 || ageNumber > 99) {
      return res.status(400).json({
        success: false,
        message: 'Age must be a number between 5 and 99',
        statusCode: 400,
      });
    }

    // Validate other fields as strings
    if (typeof firstName !== 'string' || typeof lastName !== 'string' ||
        typeof gender !== 'string' || typeof location !== 'string' ||
        typeof nationality !== 'string' || typeof reasonForJoining !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data type for one or more fields',
        statusCode: 400,
      });
    }

    // Generate unique member number
    const memberNumber = await generateMemberNumber();

    // Check if the member number is already assigned
    const existingMember = await db.Member.findOne({ where: { memberNumber } });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Member number already exists',
        statusCode: 400,
      });
    }

    // Create new member
    await db.Member.create({
      firstName,
      middleName: middleName || null,
      lastName,
      email,
      phoneNumber,
      gender,
      location,
      age: ageNumber,
      nationality,
      reasonForJoining,
      memberNumber,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Data submitted successfully, pending approval from Arkad family',
      statusCode: 201,
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing the request',
      statusCode: 500,
    });
  }
});

module.exports = router;
