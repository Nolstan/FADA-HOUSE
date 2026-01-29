const User = require('../models/user');
const bcrypt = require('bcryptjs');

/**
 * @desc   Get all users for the admin dashboard
 * @route  GET /api/admin/users
 * @access Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    // Base filter: get only users with the 'user' role
    const filter = { role: 'user' };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { username: searchRegex },
        { email: searchRegex },
        // NOTE: This assumes a 'phone' field exists in your User model
        { phone: searchRegex },
      ];
    }

    // Fetch users, excluding their passwords, and sort by creation date
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    // Get the total count of all users with the 'user' role, ignoring any search filters
    const totalUserCount = await User.countDocuments({ role: 'user' });

    // Send both the filtered users and the total count
    res.status(200).json({ users, totalUserCount });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching users.' });
  }
};

/**
 * @desc   Delete a user by ID
 * @route  DELETE /api/admin/users/:id
 * @access Private/Admin
 */
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Security: Prevent admins from deleting other admins/superadmins
    if (user.role !== 'user') {
      return res.status(403).json({ success: false, error: 'Admins cannot be deleted from this panel.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user by admin:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user.' });
  }
};

/**
 * @desc   Toggle the ban status of a user
 * @route  PUT /api/admin/users/:id/ban
 * @access Private/Admin
 */
const toggleBanStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Security: Prevent admins from banning other admins/superadmins
    if (user.role !== 'user') {
      return res.status(403).json({ success: false, error: 'Admin and superadmin accounts cannot be banned.' });
    }

    // NOTE: This assumes an 'isBanned' boolean field exists in your User model
    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({ success: true, message: `User has been ${user.isBanned ? 'banned' : 'unbanned'}.` });
  } catch (error) {
    console.error('Error toggling ban status:', error);
    res.status(500).json({ success: false, error: 'Failed to update user status.' });
  }
};

/**
 * @desc   Create a new admin user
 * @route  POST /api/admin/users/add-admin
 * @access Private/Superadmin
 */
const addAdmin = async (req, res) => {
  try {
    const { username, email, password, phone, location } = req.body;

    if (!username || !email || !password || !phone || !location) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User with this email or phone already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      location,
      role: 'admin' // Explicitly set role to admin
    });

    await newAdmin.save();
    res.status(201).json({ success: true, message: 'Admin user created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error while creating admin.' });
  }
};

/**
 * @desc   Get all admin and superadmin users
 * @route  GET /api/admin/users/admins
 * @access Private/Superadmin
 */
const getAdminUsers = async (req, res) => {
  try {
    const { search } = req.query;
    // Filter for admins and superadmins
    const filter = { role: { $in: ['admin', 'superadmin'] } };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { location: searchRegex },
      ];
    }

    // Find users, sort by role to show superadmins first, then by creation date
    const admins = await User.find(filter).select('-password').sort({ role: -1, createdAt: -1 });
    const totalAdminCount = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });

    res.status(200).json({ users: admins, totalUserCount: totalAdminCount });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching admin users.' });
  }
};

/**
 * @desc   Delete an admin user by ID
 * @route  DELETE /api/admin/users/admins/:id
 * @access Private/Superadmin
 */
const deleteAdminUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Security: Superadmins cannot delete other superadmins or themselves.
    if (userToDelete.role === 'superadmin') {
      return res.status(403).json({ success: false, error: 'Superadmin accounts cannot be deleted.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Admin user deleted successfully.' });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete admin user.' });
  }
};

/**
 * @desc   Toggle the ban status of an admin user
 * @route  PUT /api/admin/users/admins/:id/ban
 * @access Private/Superadmin
 */
const toggleAdminBan = async (req, res) => {
  try {
    const userToBan = await User.findById(req.params.id);

    if (!userToBan) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Security: Superadmins cannot be banned.
    if (userToBan.role === 'superadmin') {
      return res.status(403).json({ success: false, error: 'Superadmin accounts cannot be banned.' });
    }

    userToBan.isBanned = !userToBan.isBanned;
    await userToBan.save();

    res.status(200).json({ success: true, message: `Admin user has been ${userToBan.isBanned ? 'banned' : 'unbanned'}.` });
  } catch (error) {
    console.error('Error toggling admin ban status:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin status.' });
  }
};

/**
 * @desc   Create a new superadmin user
 * @route  POST /api/admin/users/add-superadmin
 * @access Private/Superadmin
 */
const addSuperAdmin = async (req, res) => {
  try {
    const { username, email, password, phone, location } = req.body;

    if (!username || !email || !password || !phone || !location) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User with this email or phone already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSuperAdmin = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      location,
      role: 'superadmin' // Explicitly set role to superadmin
    });

    await newSuperAdmin.save();
    res.status(201).json({ success: true, message: 'Superadmin user created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error while creating superadmin.' });
  }
};

module.exports = { getAllUsers, deleteUserById, toggleBanStatus, addAdmin, getAdminUsers, deleteAdminUser, toggleAdminBan, addSuperAdmin };