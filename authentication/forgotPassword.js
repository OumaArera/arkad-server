const express = require('express');
const db = require('../models');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

// Generate a random password with the required format
const generateRandomPassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()?/.>,<\\|[]{}=+-_';

  const allChars = uppercase + lowercase + numbers + specialChars;
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  while (password.length < 6) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const sendEmail = async (firstName, lastName, username, password) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Arkad Family" <${process.env.SMTP_USER}>`,
    to: username,
    subject: 'Password Reset',
    html: `
      <p>Dear ${firstName} ${lastName},</p>
      <p>Your password has been reset. Your new login credentials are:</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please change your password after logging in.</p>
      <p>Best regards,<br/>Arkad Family</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

router.put('/', async (req, res) => {
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
    const { username } = userData;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        statusCode: 400,
      });
    };

    const user = await db.User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    const saltKey = process.env.SALTING_KEY;
    if (!saltKey) {
      throw new Error('Missing required keys');
    }

    const password = generateRandomPassword();
    const saltedPassword = password + saltKey;
    const hashedPassword = await bcrypt.hash(saltedPassword, 10);

    // Update user's password in the database
    await db.User.update({ password: hashedPassword }, { where: { id: user.id } });

    // Send email to the user
    await sendEmail(user.firstName, user.lastName, username, password);

    return res.status(200).json({
      message: 'Password reset successfully. The new password has been sent to your email.',
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

module.exports = router;
