// 

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const authMiddleware = require('../middleware/auth-middleware');
const { uploadHostel } = require('../controllers/uploadControler');

const upload = multer({ dest: 'temp/' });

// Hostel upload route
router.post(
  '/upload-hostel',
  authMiddleware(['user', 'admin', 'superadmin']),
  upload.fields([{ name: 'photos', maxCount: 5 }]),
  uploadHostel
);

module.exports = { router };
