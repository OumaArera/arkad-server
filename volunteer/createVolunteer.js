const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer'); // Ensure nodemailer is imported
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
        subject: 'Thank You for Your Interest in Volunteering!',
        html: `
            <p>Dear ${fullName},</p>
            <br />
            <p>Thank you for expressing your interest in volunteering for <strong>${activity}</strong> with The Arkad Family. </p>
            <p>We have received your request and truly appreciate your willingness to contribute.</p>
            <p>Our team will be in touch with you soon to share more details on how you can get involved in this exciting initiative.</p>
            <p>In the meantime, if you have any questions or would like to learn more about us, feel free to visit our website or connect with us on social media.</p>
            <p>We look forward to working with you!</p>
            <br />
            <p>Best regards,<br/>The Arkad Family Team</p>
            <p>| <a href="https://arkadsmp.co.ke">Visit our website</a> |</p>
            <p>| <a href="https://facebook.com/arkadsic">Facebook</a> |</p>
            <p>| <a href="https://tiktok.com/@Arkad_SMP">TikTok</a> |</p>
            <p>| <a href="https://x.com/ArkadSMP">X(Twitter)</a> |</p>
            <p>| <a href="https://linkedin.com/company/arkadsmp">LinkedIn</a> |</p>
            <p>| <a href="https://instagram.com/arkad_sic">Instagram</a> |</p>
            <p>| <a href="https://youtube.com/@arkadfamilysic">YouTube</a> |</p>
        `,
    };

    return transporter.sendMail(mailOptions);
};

router.post('/', async (req, res) => {
  const { fullName, phoneNumber, email, activityId } = req.body;

  try {
    // Validate required fields
    if (!fullName || !email || !phoneNumber || !activityId) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid required fields',
        statusCode: 400,
      });
    };

    // Validate email format
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

    // Check if the user already submitted a request for this activity
    const volunt = await db.Volunteer.findOne({
      where: {
        email,
        activityId, // Check both email and activityId
      },
    });

    if (volunt) {
      return res.status(400).json({
        success: false,
        message: "You already submitted a request to participate in this event",
        statusCode: 400
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
    await db.Volunteer.create({ fullName, email, phoneNumber, activityId });
    await sendEmail(email, fullName, activity);

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
