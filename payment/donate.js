const express = require('express');
const db = require('../models');
const router = express.Router();
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();

const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(2547\d{8}|2541\d{8})$/;
    return phoneRegex.test(phone);
};

router.post('/', authenticateToken,  async (req, res) => {
    const { fullName, phoneNumber, amount, mpesaReceiptNumber } = req.body;

    // Validate input fields
    if (typeof fullName !== 'string' || typeof mpesaReceiptNumber !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Invalid data. fullName and mpesaReceiptNumber must be strings.',
            statusCode: 400,
        });
    }

    // Check that mpesaReceiptNumber is exactly 10 characters long
    if (mpesaReceiptNumber.length !== 10) {
        return res.status(400).json({
            success: false,
            message: 'Invalid mpesaReceiptNumber. It must be exactly 10 characters long.',
            statusCode: 400,
        });
    }

    if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format. Must be 2547xxxxxxxx or 2541xxxxxxxx.',
            statusCode: 400,
        });
    }

    // Check if amount is a positive floating-point number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid amount. Amount must be a positive floating point number.',
            statusCode: 400,
        });
    }

    // Check for duplicate transaction based on amount and mpesaReceiptNumber
    try {
        const existingDonation = await db.Transaction.findOne({
            where: {
                amount: parsedAmount,
                mpesaReceiptNumber: mpesaReceiptNumber,
            },
        });

        if (existingDonation) {
            return res.status(400).json({
                success: false,
                message: 'A transaction with the same amount and mpesaReceiptNumber already exists.',
                statusCode: 400,
            });
        }

        // Save the donation to the database
        await db.Transaction.create({
            fullName,
            phoneNumber,
            amount: parsedAmount,
            mpesaReceiptNumber,
        });

        return res.status(200).json({
            message: 'Donation received successfully.',
            success: true,
            statusCode: 200,
        });

    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            message: 'Failed to save the donation.',
            success: false,
            statusCode: 500,
        });
    }
});

module.exports = router;
