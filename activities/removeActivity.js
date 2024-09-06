const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");

const router = express.Router();

router.delete('/:id', authenticateToken, async (req, res) => {
  const achievementId = req.params.id;

  if (!achievementId) {
    return res.status(400).json({
      success: false,
      message: 'Activity ID is required',
      statusCode: 400,
    });
  }

  try {
    const result = await db.Activity.destroy({
      where: { id: achievementId }
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
        statusCode: 404,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
      statusCode: 200,
    });

  } catch (error) {
    console.error('Error deleting Activity:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      statusCode: 500,
    });
  }
});

module.exports = router;
