const express = require('express');
const db = require('../models');

const router = express.Router();

const sendEmail = async (email, fullName, amount) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Arkad Family" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Sincere Thanks for Your Generous Donation',
        html: `
            <p>Dear ${fullName},</p>
            <br />
            <p>We would like to express our heartfelt gratitude for your generous donation of <strong>KES ${amount}</strong>.</p>
            <p>Your support makes a significant difference in helping us achieve our mission at The Arkad Family.</p>
            <p>Your contribution allows us to continue our work and make a lasting impact on the community.</p>
            <p>We are deeply thankful for your generosity and belief in our cause.</p>
            <p>If you would like to stay informed about the projects you’ve supported, please feel free to connect with us through our website or on social media.</p>
            <p>We value your partnership and look forward to sharing our progress with you.</p>
            <p>Once again, thank you for your incredible support.</p>
            <br />
            <p>Best regards,<br/>The Arkad Family Team</p>
            <p>| <a href="https://arkadsmp.co.ke">Visit our website</a> |</p>
            <p>| <a href="https://facebook.com/arkadsic">Facebook</a> |</p>
            <p>| <a href="https://tiktok.com/@Arkad_SMP">TikTok</a> |</p>
            <p>| <a href="https://x.com/ArkadSMP">X(Twitter)</a> |</p>
            <p>| <a href="https://linkedin.com/company/arkadsmp">LinkedIn</a> |</p>
            <p>| <a href="https://instagram.com/arkad_sic">Instagram</a> |</p>
            <p>| <a href="ttps://youtube.com/@arkadfamilysic">YouTube</a> |</p>
        `,
    };

    return transporter.sendMail(mailOptions);
};

router.post('/', async (req, res) => {
  const callbackData = req.body.Body.stkCallback;

  try {
    if (callbackData.ResultCode === 0) {
      const amount = callbackData.CallbackMetadata.Item.find(item => item.Name === 'Amount').Value;
      const mpesaReceiptNumber = callbackData.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber').Value;
      const phoneNumber = callbackData.CallbackMetadata.Item.find(item => item.Name === 'PhoneNumber').Value;

      console.log(`Payment successful: Amount ${amount}, Receipt ${mpesaReceiptNumber}, Phone ${phoneNumber}`);

      const donor = await db.Transaction.findOne({
        where: {
          phoneNumber: phoneNumber,
          amount: amount
        }
      });

      if (donor) {
        donor.mpesaReceiptNumber = mpesaReceiptNumber;
        donor.success = true;
        await donor.save();

        await sendEmail(donor.email, donor.fullName, amount);

        return res.status(200).json({
          message: 'Payment received and donor updated successfully',
          success: true,
          statusCode: 200
        });
      } else {
        return res.status(404).json({
          message: 'Payment received successfully',
          success: true,
          statusCode: 404
        });
      }
    } else {
      console.error(`Transaction failed: ${callbackData.ResultDesc}`);
      return res.status(400).json({
        message: callbackData.ResultDesc,
        success: false,
        statusCode: 400
      });
    }
  } catch (error) {
    console.error(`Error processing transaction: ${error.message}`);
    return res.status(500).json({
      message: 'Internal Server Error',
      success: false,
      statusCode: 500
    });
  }
});

module.exports = router;
