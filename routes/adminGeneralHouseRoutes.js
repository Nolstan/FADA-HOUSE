const express = require('express');
const router = express.Router();
const {
  getAllGeneralHouses,
  deleteGeneralHouseById
} = require('../controllers/adminGeneralHouseController');
const authMiddleware = require('../middleware/auth-middleware');

// Apply authentication and admin authorization middleware
router.use(authMiddleware(['admin', 'superadmin']));

// Route to get all approved general houses with search capability
router.get('/', getAllGeneralHouses);

// Route to delete a specific general house by ID
router.delete('/:id', deleteGeneralHouseById);

module.exports = router;