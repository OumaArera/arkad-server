const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");

const router = express.Router();

// Existing GET endpoint to fetch achievements
router.get('/', authenticateToken, async (req, res) => {
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

// New DELETE endpoint to delete all achievements
router.delete('/', async (req, res) => {
  try {
    await db.Achievement.destroy({
      where: {},
      truncate: true,
    });

    return res.status(200).json({
      success: true,
      message: 'All achievements have been deleted.',
      statusCode: 200,
    });

  } catch (error) {
    console.error('Error deleting achievements:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the achievements',
      statusCode: 500,
    });
  }
});

module.exports = router;
