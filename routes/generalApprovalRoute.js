const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const GeneralHouse = require('../models/general');
const cloudinary = require('cloudinary').v2;

// Get all pending general houses
router.get('/pending', authMiddleware(['admin', 'superadmin']), async (req, res) => {
  try {
    const { search, district } = req.query;
    const query = { approval: false };

    if (search) {
      // Search by area for general houses
      query.area = new RegExp(search.trim(), 'i');
    }

    if (district) {
      query.district = district;
    }

    const houses = await GeneralHouse.find(query);
    res.json(houses);
  } catch (err) {
    console.error('Error fetching pending general houses:', err);
    res.status(500).json({ success: false, error: 'Server error fetching pending houses' });
  }
});

// Approve a general house
router.put('/:id/approve', authMiddleware(['admin', 'superadmin']), async (req, res) => {
  try {
    // VULNERABILITY: Using ...req.body allows for mass assignment.
    // FIX: Explicitly pick only the fields you expect to update.
    const { district, area, cost, description, landlordPhone, uploaderPhone } = req.body || {};

    const updateData = { approval: true };

    // Safely add fields to the update object if they exist in the request
    if (district) updateData.district = district;
    if (area) updateData.area = area;
    if (cost) updateData.cost = cost;
    if (description) updateData.description = description;
    if (landlordPhone) updateData.landlordPhone = landlordPhone;
    if (uploaderPhone) updateData.uploaderPhone = uploaderPhone;


    // Find the house by ID and update it with the new data
    // runValidators ensures that the updated data still follows your schema rules
    const house = await GeneralHouse.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!house) return res.status(404).json({ success: false, error: 'House not found' });
    res.json({ success: true, message: 'General house approved successfully', data: house });
  } catch (error) {
    console.error('Error approving general house:', error);
    res.status(500).json({ success: false, error: 'Server error during approval' });
  }
});

// Delete a general house
router.delete('/:id', authMiddleware(['admin', 'superadmin']), async (req, res) => {
  try {
    const house = await GeneralHouse.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ success: false, error: 'House not found' });
    }

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

    res.json({ success: true, message: 'General house and associated images deleted successfully.' });
  } catch (error) {
    console.error('Error during general house deletion:', error);
    res.status(500).json({ success: false, error: 'Server error during deletion.' });
  }
});

module.exports = router;