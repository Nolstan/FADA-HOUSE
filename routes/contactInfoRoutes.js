const express = require('express');
const router = express.Router();
const { getContactInfo, updateContactInfo } = require('../controllers/contactInfoController');
const authMiddleware = require('../middleware/auth-middleware');

// @route  GET /api/contact-info
// @desc   Get public contact information
router.get('/', getContactInfo);

// @route  PUT /api/contact-info
// @desc   Update contact information (Superadmin only)
router.put('/', authMiddleware(['superadmin']), updateContactInfo); // Ensure authMiddleware is applied

module.exports = router;