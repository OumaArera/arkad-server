const express = require('express');
const db = require('../models');
require('dotenv').config();

const router = express.Router();



router.get('/', async (req, res) => {
  try {
    // Fetch all achievements and order them by id in descending order
    const activities = await db.Activity.findAll({
      order: [['id', 'DESC']],
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Modify the achievements to include full image URLs
    const activitiesWithFullImageUrls = activities.map(activity => {
      return {
        ...activity.dataValues,
        image: `${baseUrl}${activity.image}`,
      };
    });

    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Missing required keys');
    }

    return res.status(200).json({
      success: true,
      data: activitiesWithFullImageUrls,
      statusCode: 200,
    });

  } catch (error) {
    console.error('Error retrieving activities:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the activities',
      statusCode: 500,
    });
  }
});

module.exports = router;
