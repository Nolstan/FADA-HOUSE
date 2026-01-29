require('dotenv').config();
const crypto = require('crypto');
const User = require('../models/user');
const transporter = require('../configs/mailer'); // Use the centralized transporter
const { getOtpTemplate } = require('../configs/emailTemplates');
const bcrypt = require('bcryptjs');

/**
 * @desc   Handle forgot password request. Generates a token and sends a reset email.
 * @route  POST /api/password/forgot
 * @access Public
 */
const requestPasswordResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // To prevent email enumeration, always send a success-like response.
        if (!user) {
            return res.status(200).json({ message: 'If an account with that email exists, a reset code has been sent.' });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Set token and expiry on the user model
        user.resetPasswordToken = otp; // We'll reuse this field for the OTP
        user.resetPasswordExpires = Date.now() + 600000; // OTP expires in 10 minutes
        user.resetPasswordAttempts = 0; // Reset attempt counter

        await user.save();

        const mailOptions = {
            from: `"${process.env.APP_NAME}" <${process.env.SENDGRID_FROM_EMAIL}>`,
            to: user.email,
            subject: 'Your Password Reset Code',
            text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n` +
                  `Your password reset code is: ${otp}\n\n` +
                  `If you did not request this, please ignore this email.\n\n` +
                  `${process.env.APP_NAME}\n${process.env.APP_PHYSICAL_ADDRESS}`, // Fallback for non-HTML clients
            html: getOtpTemplate(otp, 'Password Reset Request', process.env.APP_NAME, process.env.APP_PHYSICAL_ADDRESS)
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'If an account with that email exists, a reset code has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

/**
 * @desc   Handle the actual password reset.
 * @route  POST /api/password/reset/:token
 * @access Public
 */
const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        // Find the user by email first to check attempts
        const user = await User.findOne({
            email,
            resetPasswordExpires: { $gt: Date.now() } // Ensure token hasn't expired
        });

        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }

        // Check for too many failed attempts
        if (user.resetPasswordAttempts >= 5) {
            return res.status(400).json({ error: 'Too many failed attempts. Please request a new reset code.' });
        }

        // Now, check if the OTP matches
        if (user.resetPasswordToken !== otp) {
            user.resetPasswordAttempts += 1;
            await user.save();
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }

        // --- If OTP is correct, proceed to reset password ---

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password and clear the reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordAttempts = 0; // Clear attempts counter

        await user.save();

        res.status(200).json({ message: 'Password has been updated successfully. You can now log in.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'An error occurred while resetting the password.' });
    }
};

module.exports = {
    requestPasswordResetOtp,
    resetPasswordWithOtp
};
