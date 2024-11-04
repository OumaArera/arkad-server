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

const generateRandomPassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*?+=';
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
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Dear ${firstName} ${lastName},</p>
        <p>Welcome to the Arkad Family admin platform! Your account has been created successfully. Please use the following credentials to log in:</p>
        
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>

        <a href="https://arkad-admin.vercel.app/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Access Admin Dashboard</a>

        <p style="margin-top: 20px;">Best regards,<br/>The Arkad Family</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;"/>

        <p style="text-align: center; margin-top: 20px;">
          <a href="https://arkadsmp.co.ke" style="text-decoration: none;">
            <img src="https://path/to/website-icon.png" alt="Website" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://facebook.com/arkadsic" style="text-decoration: none;">
            <img src="https://path/to/facebook-icon.png" alt="Facebook" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://tiktok.com/@Arkad_SMP" style="text-decoration: none;">
            <img src="https://path/to/tiktok-icon.png" alt="TikTok" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://x.com/ArkadSMP" style="text-decoration: none;">
            <img src="https://path/to/twitter-icon.png" alt="Twitter" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://linkedin.com/company/arkadsmp" style="text-decoration: none;">
            <img src="https://path/to/linkedin-icon.png" alt="LinkedIn" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://instagram.com/arkad_sic" style="text-decoration: none;">
            <img src="https://path/to/instagram-icon.png" alt="Instagram" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://youtube.com/@arkadfamilysic" style="text-decoration: none;">
            <img src="https://path/to/youtube-icon.png" alt="YouTube" style="width: 24px; height: 24px;"/>
          </a>
        </p>
      </div>
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
    const { username, firstName, lastName, role } = userData;

    // Validate email format
    if (!username || !validateEmail(username)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        statusCode: 400,
      });
    }

    // Validate role
    const validRoles = ['admin', 'super-admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be either "admin" or "super-admin".',
        statusCode: 400,
      });
    }

    // Check for existing user
    const user = await db.User.findOne({ where: { username } });
    if (user) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
        statusCode: 409,
      });
    }

    const saltKey = process.env.SALTING_KEY;
    if (!saltKey) {
      throw new Error('Missing required keys');
    }

    const password = generateRandomPassword();
    const saltedPassword = password + saltKey;
    const hashedPassword = await bcrypt.hash(saltedPassword, 10);

    // Create the new user with the provided role
    await db.User.create({ username, firstName, lastName, password: hashedPassword, role });

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
