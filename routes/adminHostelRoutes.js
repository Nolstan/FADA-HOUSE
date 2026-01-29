const express = require('express');
const router = express.Router();
const {
  getAllHostels,
  deleteHostelById
} = require('../controllers/adminHostelController');
const authMiddleware = require('../middleware/auth-middleware');

// Apply authentication and admin authorization middleware
router.use(authMiddleware(['admin', 'superadmin']));

// Route to get all hostels with search capability
router.get('/', getAllHostels);

// Route to delete a specific hostel by ID
router.delete('/:id', deleteHostelById);

module.exports = router;
