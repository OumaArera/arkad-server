const express = require('express');
const { Op } = require('sequelize'); 
const CryptoJS = require('crypto-js');
const authenticateToken = require("../authentication/authenticateToken");
const db = require('../models');
require('dotenv').config();

const router = express.Router();

const encryptData = (data, key) => {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Utf8.parse(key), {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    return {
      iv: iv.toString(CryptoJS.enc.Hex),
      ciphertext: encrypted.toString(),
    };
  };

router.post('/transactions', authenticateToken, async (req, res) => {
    const { iv, ciphertext } = req.body;

    if (!iv || !ciphertext) {
        return res.status(400).json({
        success: false,
        message: 'Invalid data. Missing required fields',
        statusCode: 400,
        });
    }


    try {
        const key = process.env.ENCRYPTION_KEY;
        if (!key) {
        throw new Error('Missing required keys');
        }

        const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Hex.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
        });
        let decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
        decryptedData = decryptedData.replace(/\0+$/, '');

        const userData = JSON.parse(decryptedData);
        Object.entries(userData).forEach(([key, value]) => console.log(`${key} : ${value}`));
        const { start, end } = userData;

        if (!start || !end) {
            return res.status(400).json({
                message: "Invalid data. Missing required fields",
                success: false,
                statusCode: 400
            });
        }

        const transactions = await db.Transaction.findAll({
            where: {
                success: true,
                createdAt: {
                    [Op.between]: [new Date(start), new Date(`${end}T23:59:59`)] 
                }
            },
            order: [['createdAt', 'ASC']] 
        });

        
        if (transactions.length === 0) {
            return res.status(404).json({
                message: 'No transactions found for the given date range.',
                success: false,
                statusCode: 404
            });
        }

        const encryptedDetails = encryptData(transactions, key)

        
        return res.status(200).json({
            success: true,
            statusCode: 200,
            data: encryptedDetails
        });
    } catch (error) {
        console.error(`Error retrieving transactions: ${error.message}`);
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false,
            statusCode: 500
        });
    }
});

module.exports = router;
