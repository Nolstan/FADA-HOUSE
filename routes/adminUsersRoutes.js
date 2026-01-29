const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUserById,
  toggleBanStatus,
  addAdmin,
  getAdminUsers,
  deleteAdminUser,
  toggleAdminBan,
  addSuperAdmin,
} = require('../controllers/adminUsersController');
const authMiddleware = require('../middleware/auth-middleware');

// Route to get all users with search capability (admin & superadmin)
router.get('/', authMiddleware(['admin', 'superadmin']), getAllUsers);

// Route to delete a specific user by ID (admin & superadmin)
router.delete('/:id', authMiddleware(['admin', 'superadmin']), deleteUserById);

// Route to toggle the ban status of a user (admin & superadmin)
router.put('/:id/ban', authMiddleware(['admin', 'superadmin']), toggleBanStatus);

// Route to add a new admin user (superadmin only)
router.post('/add-admin', authMiddleware(['superadmin']), addAdmin);

// Route to add a new superadmin user (superadmin only)
router.post('/add-superadmin', authMiddleware(['superadmin']), addSuperAdmin);

// --- Superadmin-Only Routes for Managing Admins ---

// Get all admin/superadmin users
router.get('/admins', authMiddleware(['superadmin']), getAdminUsers);

// Delete an admin user
router.delete('/admins/:id', authMiddleware(['superadmin']), deleteAdminUser);

// Ban/Unban an admin user
router.put('/admins/:id/ban', authMiddleware(['superadmin']), toggleAdminBan);

module.exports = router;