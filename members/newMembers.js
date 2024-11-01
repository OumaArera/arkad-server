const express = require('express');
const db = require('../models');
require('dotenv').config();

const router = express.Router();

// Utility function to validate email format
const validateEmail = (email) => {
  if (!email) return false; // Ensure email is not undefined or null

  const trimmedEmail = email.trim();
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(trimmedEmail);
};


// Utility function to validate phone number format
const validatePhoneNumber = (phoneNumber) => {
  const re = /^(2547\d{8}|2541\d{8}|07\d{8}|01\d{8})$/;
  return re.test(String(phoneNumber));
};


// Function to generate member number
const generateMemberNumber = async () => {
  const year = new Date().getFullYear();
  
  const lastMember = await db.Member.findOne({
    where: { memberNumber: { [db.Sequelize.Op.like]: `A-%-${year}` } },
    order: [['id', 'DESC']],
  });

  let sequence = lastMember ? parseInt(lastMember.memberNumber.split('-')[1]) + 1 : 1;
  sequence = sequence.toString().padStart(4, '0');

  const memberNumber = `A-${sequence}-${year}`;

  return memberNumber;
};

router.post("/", async (req, res) => {
  const { fullName, email, phoneNumber } = req.body;

  try {
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

    // Validate full name
    if (typeof fullName !== 'string' || fullName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Full name is required and must be a string',
        statusCode: 400,
      });
    }

    // Check if the email or phone number already exists
    const existingMember = await db.Member.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { email },
          { phoneNumber }
        ]
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'A member with this email or phone number already exists',
        statusCode: 400,
      });
    }

    // Generate unique member number
    const memberNumber = await generateMemberNumber();

    // Create new member
    await db.Member.create({
      fullName,
      email,
      phoneNumber,
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
