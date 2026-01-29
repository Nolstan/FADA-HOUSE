const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const Hostel = require('../models/hostels');
const { approveHostel, deleteHostel } = require('../controllers/approvalController');

// Get all pending hostels
router.get('/', authMiddleware(['admin', 'superadmin']), async (req, res) => {
  try {
    const { search, hostelType } = req.query;

    // Base query is always for pending hostels on this page
    const query = { approval: false };

    // Add search filter if a search term is provided
    if (search) {
      // Use a regular expression for a case-insensitive search on the location
      query.location = new RegExp(search.trim(), 'i');
    }

    // Add hostel type filter if a specific type is selected
    if (hostelType) {
      query.hostelType = hostelType;
    }

    const hostels = await Hostel.find(query);
    res.json(hostels);
  } catch (err) {
    console.error('Error fetching pending hostels:', err);
    res.status(500).json({ success: false, error: 'Server error fetching pending hostels' });
  }
});

// Approve hostel
router.put('/:id/approve', authMiddleware(['admin', 'superadmin']), approveHostel);

// Delete hostel
router.delete('/:id', authMiddleware(['admin', 'superadmin']), deleteHostel);

module.exports = router;
