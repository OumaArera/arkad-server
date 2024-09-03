const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch all achievements and order them by id in descending order
    const achievements = await db.Achievement.findAll({
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: achievements,
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
