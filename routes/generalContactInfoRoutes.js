const express = require('express');
const router = express.Router();
const { getGeneralContactInfo, updateGeneralContactInfo } = require('../controllers/generalContactInfoController');
const authMiddleware = require('../middleware/auth-middleware');

// @route   GET /api/general-contact-info
router.get('/', getGeneralContactInfo);

// @route   PUT /api/general-contact-info
router.put('/', authMiddleware(['superadmin']), updateGeneralContactInfo);

module.exports = router;