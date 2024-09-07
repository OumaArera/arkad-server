const express = require('express');
const db = require('../models');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

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
  while (password.length < 9) {
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
    subject: 'Account Creation',
    html: `
      <p>Dear ${firstName} ${lastName},</p>
      <p>You have been created as a user in the Arkad Family admin platform. Your login credentials are:</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Welcome to Arkad Family,</p>
      <p>Best regards,<br/>Arkad Family</p>

      <p>| <a href="https://arkadsmp.co.ke">Visit our website</a> |</p>
      <p>| <a href="https://facebook.com/arkadsic">Facebook</a> |</p>
      <p>| <a href="https://tiktok.com/@Arkad_SMP">TikTok</a> |</p>
      <p>| <a href="https://x.com/ArkadSMP">X(Twitter)</a> |</p>
      <p>| <a href="https://linkedin.com/company/arkadsmp">LinkedIn</a> |</p>
      <p>| <a href="https://instagram.com/arkad_sic">Instagram</a> |</p>
      <p>| <a href="ttps://youtube.com/@arkadfamilysic">YouTube</a> |</p>
    `,
  };

  return transporter.sendMail(mailOptions);
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
    const { username, firstName, lastName } = userData;

    if (!username || !validateEmail(username)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        statusCode: 400,
      });
    };

    const user = await db.User.findOne({ where: { username } });

    if (user){
      return res.status(409).json({
        success: false,
        message: 'Username already exist',
        statusCode: 409
      })
    }

    const saltKey = process.env.SALTING_KEY;
    if (!saltKey) {
      throw new Error('Missing required keys');
    }

    const password = generateRandomPassword();
    const saltedPassword = password + saltKey;
    const hashedPassword = await bcrypt.hash(saltedPassword, 10);

    // Create the new user
    await db.User.create({ username, firstName, lastName, password: hashedPassword });

    // Send email to the user
    await sendEmail(firstName, lastName, username, password);

    return res.status(201).json({
      message: 'User created successfully',
      success: true,
      statusCode: 201,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
        statusCode: 409,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});


module.exports = router;
