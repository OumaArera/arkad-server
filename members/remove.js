const express = require('express');
const router = express.Router();
const { Member } = require('../models'); 

// DELETE endpoint to remove all data from the Member table
router.delete('/', async (req, res) => {
  try {
    // Destroy all records in the Member table
    await Member.destroy({
      where: {},
      truncate: true, // This ensures that all rows are removed and reset auto-increment
    });

    // Send success response
    res.status(200).json({
      message: 'All members have been successfully deleted',
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      message: 'Failed to delete all members',
      error: error.message,
    });
  }
});

module.exports = router;
