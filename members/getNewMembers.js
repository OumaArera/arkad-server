const express = require('express');
const authenticateToken = require("../authentication/authenticateToken");
const db = require('../models');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const pendingMembers = await db.Member.findAll({
      where: { status: 'pending' },
      order: [['id', 'ASC']], 
    });

    if (pendingMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pending members found',
        statusCode: 404,
      });
    }

    return res.status(200).json({
      success: true,
      data: pendingMembers,
      statusCode: 200,
    });

  } catch (error) {
    console.error('Error retrieving pending members:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving pending members',
      statusCode: 500,
    });
  }
});

module.exports = router;