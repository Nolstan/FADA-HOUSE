const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {       
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: false, // Not all users (like regular users) will have a location
    trim: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin','superadmin'],
    default: 'user'
  },
  otp: {
    type: String,
    required: false
  },
  otpExpiry: {
    type: Date,
    required: false
  },
  otpRequestTimestamp: {
    type: Date,
    required: false
  },
  otpRequestCount: {
    type: Number,
    default: 0
  },
  otpRequestDate: {
    type: Date,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetPasswordAttempts: {
        type: Number,
        default: 0
    },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
