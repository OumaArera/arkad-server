const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Fetch all achievements and order them by id in descending order
    const achievements = await db.Achievement.findAll({
      order: [['id', 'DESC']],
    });

    // Get the base URL from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Modify the achievements to include full image URLs
    const achievementsWithFullImageUrls = achievements.map(achievement => {
      return {
        ...achievement.dataValues,
        image: `${baseUrl}${achievement.image}`,
      };
    });

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
