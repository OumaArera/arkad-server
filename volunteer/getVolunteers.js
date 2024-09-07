const express = require('express');
const db = require('../models');
const CryptoJS = require('crypto-js');
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();

const router = express.Router();

const encryptData = (data, key) => {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Utf8.parse(key), {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    return {
      iv: iv.toString(CryptoJS.enc.Hex),
      ciphertext: encrypted.toString(),
    };
  };

router.get('/', authenticateToken, async (req, res) => {
  try {
    const currentDate = new Date();

    const activities = await db.Activity.findAll({
      where: {
        date: {
          [db.Sequelize.Op.gt]: currentDate, 
        },
      },
      include: [{
        model: db.Volunteer, 
        as: 'volunteers',
      }],
    });

    if(!activities){
        return res.status(404).json({
            success: false,
            message: 'There are no upcoming activities',
            statusCode: 404,
          });
    }

    const groupedVolunteers = activities.map((activity) => ({
      activityTitle: activity.title,
      volunteers: activity.volunteers.map((volunteer) => ({
        fullName: volunteer.fullName,
        phoneNumber: volunteer.phoneNumber,
        email: volunteer.email,
        location: volunteer.location,
      })),
    }));

    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    const encrptedDetails = encryptData(groupedVolunteers, key);

    return res.status(200).json({
      success: true,
      data:encrptedDetails,
      statusCode: 200,
    });

  } catch (error) {
    console.error('Error fetching volunteers by activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

module.exports = router;
