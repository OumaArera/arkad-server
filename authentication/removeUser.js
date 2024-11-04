const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authenticateToken = require("../authentication/authenticateToken");

// DELETE /users/:id endpoint to delete a user by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  // Check if the logged-in user's role is 'super-admin'
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Only super-admins can delete users'
    });
  }

  try {
    // Find the user by ID and delete
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while deleting the user'
    });
  }
});

module.exports = router;
