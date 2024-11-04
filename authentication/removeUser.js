const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authenticateToken = require("../authentication/authenticateToken");

// Endpoint to block a user by ID (change their status to 'blocked')
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  // Check if the logged-in user's role is 'super-admin'
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Only super-admins can block users'
    });
  }

  try {
    // Find the user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update the user's status to 'blocked'
    user.status = 'blocked';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while blocking the user'
    });
  }
});

module.exports = router;
