const express = require('express');
const { 
    registerUser, 
    loginUser,
    verifyOTP,
    resendOTP
} = require('../controllers/user-controller');

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// --- OTP Routes ---
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

module.exports = router;