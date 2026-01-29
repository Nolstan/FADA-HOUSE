require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const crypto = require('crypto');
const User = require('../models/user');
const transporter = require('../configs/mailer'); // Use the centralized transporter
const { getOtpTemplate } = require('../configs/emailTemplates');

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

/**
 * Utility: send OTP email (non-blocking)
 */
const sendOTPEmail = async (to, otp, subject) => {
    try {
        await transporter.sendMail({
            from: `"${process.env.APP_NAME}" <${process.env.SENDGRID_FROM_EMAIL}>`, // Display name + verified sender
            to,
            replyTo: process.env.SENDGRID_FROM_EMAIL, // Make reply-to consistent with the sender for better deliverability
            subject,
            // Using text and html for better compatibility
            text: `Your One-Time Password (OTP) is: ${otp}. It will expire in 15 minutes.
            
${process.env.APP_NAME}
${process.env.APP_PHYSICAL_ADDRESS}`, // Fallback for non-HTML clients
            html: getOtpTemplate(otp, 'Account Verification', process.env.APP_NAME, process.env.APP_PHYSICAL_ADDRESS),
        });
        console.log(`OTP sent to ${to}: ${otp}`); // log OTP in backend
    } catch (err) {
        console.error("Email sending failed:", err);
    }
};

/**
 * Register new user
 * @route POST /api/users/register
 */
const registerUser = async (req, res) => {
    const { username, email, password, phone, role } = req.body;

    try {
        if (role === 'admin' || role === 'superadmin') {
            return res.status(403).json({ error: 'Admin registration is not allowed through this endpoint.' });
        }

        if (!username || !email || !password || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        let existingUser = await User.findOne({ $or: [{ email }, { phone }] });

        if (existingUser) {
            if (existingUser.isVerified) {
                let field = existingUser.phone === phone ? 'phone number' : 'email';
                return res.status(409).json({ error: `A user with this ${field} is already registered and verified.` });
            }

            // Update existing unverified user
            existingUser.password = await bcrypt.hash(password, 10);
            existingUser.otp = generateOTP();
            existingUser.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
            existingUser.otpRequestCount = 1;
            existingUser.otpRequestDate = new Date();
            existingUser.otpRequestTimestamp = new Date();

            await existingUser.save();

            // Respond immediately (don’t block on email)
            res.status(200).json({
                success: true,
                message: 'Account existed but was not verified. OTP sent again.',
            });

            // Send email in background
            sendOTPEmail(email, existingUser.otp, 'Account Verification OTP');
            return;
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const now = new Date();

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            role: 'user',
            otp,
            otpExpiry: new Date(Date.now() + 15 * 60 * 1000),
            otpRequestCount: 1,
            otpRequestDate: now,
            otpRequestTimestamp: now,
        });

        await newUser.save();

        // Respond immediately
        res.status(201).json({
            success: true,
            message: 'User registered. Please check your email for the verification OTP.',
        });

        // Send email async
        sendOTPEmail(email, otp, 'Account Verification OTP');

    } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

/**
 * Login user
 * @route POST /api/users/login
 */
const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const potentialUsers = await User.find({
            $or: [
                { username: identifier },
                { email: identifier.toLowerCase() }
            ]
        });

        if (!potentialUsers || potentialUsers.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!identifier.includes('@') && potentialUsers.length > 1) {
            return res.status(409).json({ error: 'Please log in using your email address.' });
        }

        const user = potentialUsers[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        if (user.isBanned) {
            return res.status(403).json({ error: 'Your account has been suspended.' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Your account is not verified. Check your email for the OTP.' });
        }

        const token = jwt.sign(
            { _id: user._id, role: user.role, username: user.username },
            process.env.JSONWEB_TOKEN_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            role: user.role,
            token,
            user: { _id: user._id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

/**
 * Verify OTP
 * @route POST /api/users/verify-otp
 */
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or OTP.' });
        if (user.isVerified) return res.status(400).json({ error: 'This account is already verified.' });

        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ error: 'OTP invalid or expired.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Account verified successfully. You can now log in.' });
    } catch (err) {
        console.error('Error during OTP verification:', err.message);
        res.status(500).json({ error: 'Server error during verification.' });
    }
};

/**
 * Resend OTP
 * @route POST /api/users/resend-otp
 */
const resendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ error: 'This account is already verified.' });

        const now = new Date();
        const DAILY_OTP_LIMIT = 5;

        if (user.otpRequestDate) {
            const lastRequestDay = user.otpRequestDate.toISOString().split('T')[0];
            const today = now.toISOString().split('T')[0];
            if (lastRequestDay < today) user.otpRequestCount = 0;
        }

        if (user.otpRequestCount >= DAILY_OTP_LIMIT) {
            return res.status(429).json({ error: 'Daily OTP request limit reached. Try again tomorrow.' });
        }

        if (user.otpRequestTimestamp && (now - user.otpRequestTimestamp < 60000)) {
            const timeLeft = Math.ceil((60000 - (now - user.otpRequestTimestamp)) / 1000);
            return res.status(429).json({ error: `Wait ${timeLeft} seconds before requesting a new OTP.` });
        }

        user.otp = generateOTP();
        user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
        user.otpRequestTimestamp = now;
        user.otpRequestDate = now;
        user.otpRequestCount = (user.otpRequestCount || 0) + 1;
        await user.save();

        res.status(200).json({ success: true, message: 'A new OTP has been sent to your email.' });

        // Send email async
        sendOTPEmail(email, user.otp, 'New Account Verification OTP');
    } catch (err) {
        console.error('Error resending OTP:', err.message);
        res.status(500).json({ error: 'Server error while resending OTP.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP
};