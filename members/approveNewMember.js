const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();

const router = express.Router();

router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Validate required fields
    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Missing required status field",
            statusCode: 400
        });
    }

    try {
        const member = await db.Member.findOne({ where: { id: id } });

        // Check if member exists
        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
                statusCode: 404
            });
        }

        // Handle approval
        if (status === "approved") {
            member.status = "approved";
            await member.save();
            return res.status(200).json({
                success: true,
                message: "Member approved successfully",
                statusCode: 200
            });

        // Handle decline with a reason
        } else if (status === "declined") {
            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: "Decline reason is required when declining a member",
                    statusCode: 400
                });
            }

            member.status = "declined";
            member.declineReason = reason;
            await member.save();
            return res.status(200).json({
                success: true,
                message: "Member declined successfully",
                statusCode: 200
            });
        } else {
            // Invalid status provided
            return res.status(400).json({
                success: false,
                message: "Invalid status provided",
                statusCode: 400
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            statusCode: 500,
        });
    }
});

module.exports = router;
