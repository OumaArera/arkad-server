const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();

const router = express.Router();

router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const memeber = await db.Member.findOne({ where: { id: id } });

        if (!memeber) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
                statusCode: 404
            });
        }

        memeber.status = "active";
        await memeber.save();

        return res.status(200).json({
            success: true,
            message: "Member marked as active",
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
