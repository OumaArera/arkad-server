const express = require('express');
const axios = require('axios');
const db = require('../models');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const router = express.Router();
require('dotenv').config();

// Import the access token generator
// const { generateAccessToken } = require('./generateAccessToken');

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

const generateAccountReference = () => {
    const now = moment(); 
    const year = now.format('YYYY');
    const month = now.format('MM');
    const date = now.format('DD');
    const hour = now.format('HH');
    const minute = now.format('mm');
    const second = now.format('ss');

    // Generate a random capital letter and random digit
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); 
    const randomDigit = Math.floor(Math.random() * 10); 

    return `A-${year}-${month}-${date}-${hour}-${minute}-${second}-${randomLetter}${randomDigit}`;
};

const validatePhoneNumber = (phone) => {
    const phoneRegex = /^254\d{9}$/;
    return phoneRegex.test(phone);
  };
  
const generateAccessToken = async () => {
    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
    try {
      const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error generating access token:', error);
      throw error;
    }
};

router.post('/', async (req, res) => {
  const { iv, ciphertext } = req.body;
  // const { phone, fullName, email, amount } = req.body;

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
    const { phone, fullName, email, amount } = userData;

    if(!phone || !fullName || !email || !amount){
        return res.status(400).json({
            message: 'Invalid data. Missing required fields',
            success: false,
            statusCode: 400
          });
    };

    if(!validatePhoneNumber(phone)){
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format',
            statusCode: 400,
          });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
          statusCode: 400,
        });
      };

    const accountReference = generateAccountReference();
    const donationDetails = "Donation";
    const transactionDesc = "Donation to Arkad Family"

    const timestamp = moment().format('YYYYMMDDHHmmss');

    // Encode Password (Shortcode + Passkey + Timestamp)
    const password = Buffer.from(
        `${process.env.BUSINESS_SHORTCODE}${process.env.PASSKEY}${timestamp}`
    ).toString('base64');

    const accessToken = await generateAccessToken();

    // Prepare STK Push request data
    const stkPushRequest = {
      BusinessShortCode: process.env.BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.BUSINESS_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: donationDetails,
      TransactionDesc: transactionDesc,
    };

    const MPESA_API = process.env.MPESA_API;

    const response = await fetch(MPESA_API,{
      method:"POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        },
      body: JSON.stringify(stkPushRequest)
      });

    const result = await response.json();
    Object.entries(result).forEach(([key, value]) => console.log(`${key} : ${JSON.stringify(value)}`));
    await db.Transaction.create({
        transactionId: accountReference,
        fullName,
        amount,
        email,
        phoneNumber: phone,
        mpesaReceiptNumber: null
    })
    

    return res.status(200).json({
      message: 'STK Push initiated, you\'ll receive a prompt to enter your MPESA PIN',
      success: true,
      statusCode: 200
    });
  } catch (error) {
    console.error('STK Push error:', error);
    return res.status(500).json({
        message: `Failed to initiate STK Push`,
        success: true,
        statusCode: 500
    });
  }
});

module.exports = router;
