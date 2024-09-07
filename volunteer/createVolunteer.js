const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const router = express.Router();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const sendEmail = async (email, fullName, activity) => {
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
        to: email,
        subject: 'Welcome to the Arkad Family!',
        html: `
            <p>Dear ${fullName},</p>
            
            <p>Best regards,<br/>The Arkad Family Team</p>
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
    Object.entries(userData).forEach(([key, value]) => console.log(`${key} : ${value}`));
    const { activityId, fullName, phoneNumber, email, location } = userData;

    if (!fullName || !email || !phoneNumber || !location || !activityId) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid required fields',
        statusCode: 400,
      });
    };

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        statusCode: 400,
      });
    }

    // Find the activity
    const activity = await db.Activity.findOne({ where: { id: activityId } });

    // Check if the activity exists
    if (!activity) {
      return res.status(400).json({
        success: false,
        message: 'Activity does not exist',
        statusCode: 400,
      });
    }

    // Check if the activity date has already passed
    const currentDate = new Date();
    if (new Date(activity.date) < currentDate) {
      return res.status(400).json({
        success: false,
        message: 'The activity you are trying to volunteer for has already happened',
        statusCode: 400,
      });
    }

    // Proceed to create a new volunteer entry
    await db.Volunteer.create({ fullName, email, phoneNumber, location, activityId });

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
