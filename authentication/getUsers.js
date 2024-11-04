// routes/users.js
const express = require('express');
const router = express.Router();
const { User } = require('../models'); 

// GET /users endpoint to retrieve all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll(); 
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});

module.exports = router;
