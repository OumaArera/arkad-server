const express = require('express');
const db = require('../models');
const authenticateToken = require("../authentication/authenticateToken");
require('dotenv').config();


const router = express.Router();

const sendEmail = async (email, memberNumber, firstName) => {
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
        subject: 'Welcome to the Arkad Family!',
        html: `
            <p>Dear ${firstName},</p>
            <p>We are thrilled to inform you that your request to join the Arkad Family has been approved!</p>
            <p><strong>Member Number:</strong> ${memberNumber}</p>
            <p>As a member of the Arkad Family, you are part of a vibrant community dedicated to fostering socio-economic independence across Africa. Your journey with us will involve:</p>
            <ul>
                <li>Participating in various community initiatives aimed at financial management, holistic learning, and talent development.</li>
                <li>Engaging in our projects and events that contribute to personal growth and community impact.</li>
                <li>Collaborating with fellow members to support and promote our vision of socio-economic development.</li>
            </ul>
            <p>We encourage you to stay updated on our activities through our website and social media channels. Feel free to reach out through our contact forms or join discussions in our community forums.</p>
            <p>Welcome aboard, and thank you for joining us in this impactful journey.</p>
            <p>Best regards,<br/>The Arkad Family Team</p>
            <br /> 
            <p style="text-align: center; margin-top: 20px;">
                <a href="https://arkadsmp.co.ke" style="text-decoration: none;">
                    <img src="/website.png" alt="Website" style="width: 24px; height: 24px; margin-right: 10px;"/>
                </a>
                <a href="https://facebook.com/arkadsic" style="text-decoration: none;">
                    <img src="/facebook.png" alt="Facebook" style="width: 24px; height: 24px; margin-right: 10px;"/>
                </a>
                <a href="https://tiktok.com/@Arkad_SMP" style="text-decoration: none;">
                    <img src="/tiktok.png" alt="TikTok" style="width: 24px; height: 24px; margin-right: 10px;"/>
                </a>
                <a href="https://x.com/ArkadSMP" style="text-decoration: none;">
                    <img src="/x.jpg" alt="Twitter" style="width: 24px; height: 24px; margin-right: 10px;"/>
                </a>
                <a href="https://linkedin.com/company/arkadsmp" style="text-decoration: none;">
                    <img src="/linkedind.png" alt="LinkedIn" style="width: 24px; height: 24px; margin-right: 10px;"/>
                </a>
                <a href="https://instagram.com/arkad_sic" style="text-decoration: none;">
                    <img src="/instagram.jpeg" alt="Instagram" style="width: 24px; height: 24px; margin-right: 10px;"/>
                </a>
                <a href="https://youtube.com/@arkadfamilysic" style="text-decoration: none;">
                    <img src="/youtube.png" alt="YouTube" style="width: 24px; height: 24px;"/>
                </a>
            </p>
            
        `,
    };

    return transporter.sendMail(mailOptions);
};

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
            await sendEmail(member.email, member.memberNumber, member.firstName);
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
