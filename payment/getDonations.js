const express = require('express');
const db = require('../models');
const router = express.Router();
const { Op } = require('sequelize');
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();

router.get('/', authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!startDate || !endDate || !dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Start date and end date must be in YYYY-MM-DD format.',
            statusCode: 400,
        });
    }

    try {
        // Query the database for transactions within the date range
        const transactions = await db.Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(`${startDate}T00:00:00`), new Date(`${endDate}T23:59:59`)],
                },
            },
            order: [['createdAt', 'ASC']], // Order by creation date in ascending order
        });

        return res.status(200).json({
            success: true,
            transactions,
            statusCode: 200,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions.',
            statusCode: 500,
        });
    }
});

module.exports = router;
