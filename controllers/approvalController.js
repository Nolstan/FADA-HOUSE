const Hostel = require('../models/hostels');
const cloudinary = require('cloudinary').v2;

// Approve and update a hostel
exports.approveHostel = async (req, res) => {
  try {
    const { id } = req.params;
    // VULNERABILITY: Using ...req.body allows for mass assignment.
    // A user could inject fields like `role` or `uploadedBy`.
    // FIX: Explicitly pick only the fields you expect to update.
    const {
      rent, location, distance, occupancy,
      landlordPhone, paymentNumber, hostelType,
      description, rules, utilities
    } = req.body;

    const updateData = { approval: true };

    // Safely add fields to the update object if they exist in the request
    if (rent) updateData.rent = rent;
    if (location) updateData.location = location;
    if (distance) updateData.distance = distance;
    if (occupancy) updateData.occupancy = occupancy;
    if (landlordPhone) updateData.landlordPhone = landlordPhone;
    if (paymentNumber) updateData.paymentNumber = paymentNumber;
    if (hostelType) updateData.hostelType = hostelType;
    // Check for undefined to allow empty strings for description/rules
    if (description !== undefined) updateData.description = description;
    if (rules !== undefined) updateData.rules = rules;
    if (utilities !== undefined) updateData.utilities = utilities;

    // Find by ID and update with new data + approval = true
    const updatedHostel = await Hostel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedHostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found' });
    }

    res.json({ success: true, message: 'Hostel approved and updated', data: updatedHostel });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ success: false, error: 'Server error during approval' });
  }
};

// Delete a hostel
exports.deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found' });
    }

    if (hostel.photos && hostel.photos.length > 0) {
      const publicIds = hostel.photos.map(url => {
        const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
        return match ? match[1] : null;
      }).filter(id => id);

      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
      }
    }

    await Hostel.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Hostel and associated images deleted successfully.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: 'Server error during deletion' });
  }
};
