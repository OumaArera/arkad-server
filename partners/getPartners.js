const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");
const { Op } = require('sequelize');

const router = express.Router();

// Helper function to convert to title case
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Endpoint to retrieve partners within a specific date range
router.get('/', authenticateToken, async (req, res) => {
  const { start, end } = req.body;

  // Validate the existence of start and end date
  if (!start || !end) {
    return res.status(400).json({
      success: false,
      message: 'Missing start or end date',
      statusCode: 400,
    });
  }

  // Convert start and end dates to valid date formats
  const startDate = new Date(`${start}-01`); 
  const endDate = new Date(`${end}-01`);
  endDate.setMonth(endDate.getMonth() + 1); 

  // Validate that dates are valid
  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Please use "YYYY-MM" format for start and end',
      statusCode: 400,
    });
  }

  try {
    // Query the database to retrieve partners within the date range
    const partners = await db.Partner.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    if (partners.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No partners found in the given date range',
        statusCode: 404,
      });
    }

    // Convert organizationName to title case before sending the response
    const partnersWithTitleCase = partners.map((partner) => ({
      ...partner.toJSON(),
      organizationName: toTitleCase(partner.organizationName),
    }));

    return res.status(200).json({
      success: true,
      data: partnersWithTitleCase,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error retrieving partners:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});

module.exports = router;
