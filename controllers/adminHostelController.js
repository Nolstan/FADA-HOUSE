const Hostel = require('../models/hostels');
const cloudinary = require('cloudinary').v2;

/**
 * @desc   Get all hostels for the admin dashboard
 * @route  GET /api/admin/hostels
 * @access Private/Admin
 */
const getAllHostels = async (req, res) => {
  try {
    const { search, occupancy } = req.query;
    const filter = {};
    if (occupancy && !isNaN(occupancy)) {
      filter.occupancy = parseInt(occupancy, 10);
    }

    // If a general search term is provided, add it to the filter
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { location: searchRegex },
        { landlordPhone: searchRegex },
        { paymentNumber: searchRegex }, // Assuming paymentNumber is the uploader's phone
      ];
    }

    // Fetch all hostels based on the filter, sorted by most recent
    const hostels = await Hostel.find(filter).sort({ createdAt: -1 });

    // Format the data for the frontend, sending only the first 2 photos
    const formattedHostels = hostels.map(hostel => ({
      _id: hostel._id,
      name: `Hostel #${hostel._id.toString().slice(-6)}`,
      location: hostel.location,
      pricePerMonth: hostel.rent,
      bookingFee: hostel.bookingFee,
      peoplePerRoom: hostel.occupancy,
      landlordPhone: hostel.landlordPhone,
      uploaderPhone: hostel.paymentNumber,
      description: hostel.description,
      photos: hostel.photos.slice(0, 2) // Only take the first two photos
    }));

    res.status(200).json(formattedHostels);
  } catch (error) {
    console.error('Error fetching hostels for admin:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching hostels.' });
  }
};

/**
 * @desc   Delete a hostel by ID
 * @route  DELETE /api/admin/hostels/:id
 * @access Private/Admin
 */
const deleteHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndDelete(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found.' });
    }

    // Delete associated photos from Cloudinary
    if (hostel.photos && hostel.photos.length > 0) {
      // Safely extract public_ids from the full Cloudinary URLs
      const publicIds = hostel.photos.map(url => {
        const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
        return match ? match[1] : null;
      }).filter(id => id); // Filter out any nulls from malformed URLs
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
      }
    }

    res.status(200).json({ success: true, message: 'Hostel deleted successfully.' });
  } catch (error) {
    console.error('Error deleting hostel by admin:', error);
    res.status(500).json({ success: false, error: 'Failed to delete hostel.' });
  }
};

module.exports = { getAllHostels, deleteHostelById };
