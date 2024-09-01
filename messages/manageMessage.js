const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();

const router = express.Router();

router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const message = await db.Message.findOne({ where: { id: id } });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
                statusCode: 404
            });
        }

        message.status = "read";
        await message.save();

        return res.status(200).json({
            success: true,
            message: "Message marked as read",
            statusCode: 200
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            statusCode: 500,
        });
    }
});

module.exports = router;
