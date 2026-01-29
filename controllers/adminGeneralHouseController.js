const GeneralHouse = require('../models/general');
const cloudinary = require('cloudinary').v2;

/**
 * @desc   Get all APPROVED general houses for the admin delete dashboard
 * @route  GET /api/admin/general-houses
 * @access Private/Admin
 */
const getAllGeneralHouses = async (req, res) => {
  try {
    const { search } = req.query;
    // Base filter: get only APPROVED houses
    const filter = { approval: true };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { area: searchRegex },
        { district: searchRegex },
        { landlordPhone: searchRegex },
        { uploaderPhone: searchRegex },
      ];
    }

    const houses = await GeneralHouse.find(filter).sort({ createdAt: -1 });
    res.status(200).json(houses);
  } catch (error) {
    console.error('Error fetching general houses for admin:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching houses.' });
  }
};

/**
 * @desc   Delete a general house by ID
 * @route  DELETE /api/admin/general-houses/:id
 * @access Private/Admin
 */
const deleteGeneralHouseById = async (req, res) => {
  try {
    const house = await GeneralHouse.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ success: false, error: 'House not found.' });
    }

    // Delete associated photos from Cloudinary
    if (house.photos && house.photos.length > 0) {
      const publicIds = house.photos.map(url => {
        const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
        return match ? match[1] : null;
      }).filter(id => id);
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
      }
    }
    
    await GeneralHouse.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'General house deleted successfully.' });
  } catch (error) {
    console.error('Error deleting general house by admin:', error);
    res.status(500).json({ success: false, error: 'Failed to delete house.' });
  }
};

module.exports = { getAllGeneralHouses, deleteGeneralHouseById };