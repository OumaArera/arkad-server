const express = require('express');
const db = require('../models');
const nodemailer = require('nodemailer');
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
      <p>Thank you for expressing your interest in volunteering for <strong>${activity}</strong> with The Arkad Family.</p>
      <p>We have received your request and truly appreciate your willingness to contribute.</p>
      <p>Our team will be in touch with you soon to share more details on how you can get involved in this exciting initiative.</p>
      <p>In the meantime, if you have any questions or would like to learn more about us, feel free to visit our website or connect with us on social media.</p>
      <p>We look forward to working with you!</p>
      <br />
      <p style="text-align: center; margin-top: 20px;">
          <a href="https://arkadsmp.co.ke" style="text-decoration: none;">
            <img src="/website.png" alt="Website" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://facebook.com/arkadsic" style="text-decoration: none;">
            <img src="/facebook.png" alt="Facebook" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://tiktok.com/@Arkad_SMP" style="text-decoration: none;">
            <img src="/tiktok.png" alt="TikTok" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://x.com/ArkadSMP" style="text-decoration: none;">
            <img src="/x.jpg" alt="Twitter" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://linkedin.com/company/arkadsmp" style="text-decoration: none;">
            <img src="/linkedind.png" alt="LinkedIn" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://instagram.com/arkad_sic" style="text-decoration: none;">
            <img src="/instagram.jpeg" alt="Instagram" style="width: 24px; height: 24px; margin-right: 10px;"/>
          </a>
          <a href="https://youtube.com/@arkadfamilysic" style="text-decoration: none;">
            <img src="/youtube.png" alt="YouTube" style="width: 24px; height: 24px;"/>
          </a>
        </p>
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

    // Fetch the activity to ensure it exists and to retrieve its details
    const activity = await db.Activity.findByPk(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
        statusCode: 404,
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
    await sendEmail(email, fullName, activity.title); // Change `activity` to `activity.name` or whatever relevant field you want to send in the email

    return res.status(201).json({
      message: 'Request sent successfully',
      success: true,
      statusCode: 201,
    });

  } catch (error) {
    console.error('Error:', error); // Log the error to console for debugging
    return res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message || error}`,
      statusCode: 500,
    });
  }
});

module.exports = router;
