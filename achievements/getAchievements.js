const express = require('express');
const db = require('../models');
require('dotenv').config();

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const achievements = await db.Achievement.findAll({
      order: [['id', 'DESC']],
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const achievementsWithFullImageUrls = achievements.map(achievement => {
      return {
        ...achievement.dataValues,
        image: `${baseUrl}${achievement.image}`,
      };
    });

    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    return res.status(200).json({
      success: true,
      data: achievementsWithFullImageUrls,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error retrieving achievements:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the achievements',
      statusCode: 500,
    });
  }
});

module.exports = router;
