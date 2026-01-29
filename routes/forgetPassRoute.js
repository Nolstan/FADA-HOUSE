const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requestPasswordResetOtp, resetPasswordWithOtp } = require('../controllers/forgetPasswordController');

// Apply rate limiting to the OTP request endpoint
const otpLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 OTP requests per window
	message: { error: 'Too many password reset requests from this IP, please try again after 15 minutes' },
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// @route   POST /api/password/request-otp
// @desc    Request password reset OTP
router.post('/request-otp', otpLimiter, requestPasswordResetOtp);

// @route   POST /api/password/reset-with-otp
// @desc    Reset password with OTP
router.post('/reset-with-otp', resetPasswordWithOtp);

module.exports = router;