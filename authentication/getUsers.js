const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authenticateToken = require("../authentication/authenticateToken");

// GET /users endpoint to retrieve all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Retrieve users without including the password field
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'username', 'status', 'role', 'createdAt', 'updatedAt']
    });

    // Structure the response with data and success keys
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An error occurred while fetching users' 
    });
  }
});

module.exports = router;
