const express = require('express');
const db = require('../models');
require('dotenv').config();

const router = express.Router();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

router.post("/", async(req, res) =>{
    const { email } = req.body;

    try {
        if (!email || !validateEmail(email)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid email format',
              statusCode: 400,
            });
          };
        const existingSubscription = await db.Subscription.findOne({ where: { email } });
        if (existingSubscription) {
        return res.status(409).json({
            success: false,
            message: 'Email is already subscribed',
            statusCode: 409,
        });
        }
    
        await db.Subscription.create({ email, status: "active" });

        return res.status(201).json({
            success: true,
            message: "Email subscribed successfully",
            statusCode: 201
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            statusCode: 500
        });
    };
});

module.exports = router;