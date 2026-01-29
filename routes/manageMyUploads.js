const express = require('express');
const router = express.Router();
const { 
  getMyUploads, editHostel, deleteHostel,
  getMyGeneralHouseUploads, editGeneralHouse, deleteGeneralHouse
} = require('../controllers/manageMyUploads');
const authMiddleware = require('../middleware/auth-middleware'); 

// All routes require authentication
router.use(authMiddleware(['user', 'admin', 'superadmin']));

// --- Hostel Routes ---
// Get current user's hostel uploads
router.get('/:userId', getMyUploads);
// Edit a hostel
router.put('/:id', editHostel);
// Delete a hostel
router.delete('/:id', deleteHostel);

// --- General House Routes ---
// Get current user's general house uploads
router.get('/general/:userId', getMyGeneralHouseUploads);
// Edit a general house
router.put('/general/:id', editGeneralHouse);
// Delete a general house
router.delete('/general/:id', deleteGeneralHouse);

module.exports = router;
