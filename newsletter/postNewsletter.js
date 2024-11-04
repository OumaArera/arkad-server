const express = require('express');
const db = require('../models'); 
const CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();


const router = express.Router();

const decryptData = (iv, ciphertext) => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Missing required encryption key');
  }

  const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Hex.parse(iv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  let decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
  decryptedData = decryptedData.replace(/\0+$/, ''); 
  return JSON.parse(decryptedData);
};

// Email sending function
const sendNewsletterEmail = async (recipientEmail, title, content, sources) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, 
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
        },
    });

    const formattedSources = sources && Array.isArray(sources) 
    ? `<ul>${sources.map(source => `<li>${source}</li>`).join('')}</ul>`
    : '';

    const mailOptions = {
    from: `"Arkad Family" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `${title}`,
    html: `
        <p>Dear Arkad Family member,</p>
        <p>${content}</p>
        ${formattedSources ? `<p><strong>Sources:</strong></p>${formattedSources}` : ''}
        <p>Best regards,<br/>Arkad Family</p>
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


router.post('/', authenticateToken, async (req, res) => {
  const { iv, ciphertext } = req.body;

  if (!iv || !ciphertext) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data. Missing required fields',
      statusCode: 400,
    });
  }

  try {
    const newsletterData = decryptData(iv, ciphertext);
    const { userId, title, content, sources } = newsletterData;

    // Validate the required fields
    if (!userId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, title, or content',
        statusCode: 400,
      });
    }

    // Persist the newsletter in the database
    const newNewsletter = await db.Newsletter.create({
      userId,
      title,
      content,
      sources: sources || null
    });

    // Retrieve active subscriptions
    const activeSubscriptions = await db.Subscription.findAll({
      where: { status: 'active' },
      attributes: ['email']  
    });

    if (activeSubscriptions.length > 0) {
        const emailPromises = activeSubscriptions.map(subscription =>
            sendNewsletterEmail(subscription.email, newNewsletter.title, newNewsletter.content, newNewsletter.sources)
          );
          await Promise.all(emailPromises);
      
          return res.status(201).json({
            success: true,
            message: 'Newsletter created and sent to subscribers',
            statusCode: 201,
          });
    }else{
        return res.status(201).json({
            success: true,
            message: 'Newsletter created successfully',
            statusCode: 201,
          });
    }

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
