const Hostel = require('../models/hostels');
const GeneralHouse = require('../models/general');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Get all hostels uploaded by logged-in user
const getMyUploads = async (req, res) => {
  try {
    const paramUserId = req.params.userId;
    const loggedInUserId = req.user._id.toString();

    // Security check: Ensure the logged-in user is requesting their own data
    if (paramUserId !== loggedInUserId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only view your own uploads.' });
    }

    const hostels = await Hostel.find({ uploadedBy: paramUserId });
    res.status(200).json(hostels); // Sending the array directly matches the frontend expectation
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Edit hostel (reset approval to false)
const editHostel = async (req, res) => {
  try {
    const hostelId = req.params.id;
    const userId = req.user._id;

    const hostel = await Hostel.findOne({ _id: hostelId, uploadedBy: userId });
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found or not owned by user' });
    }

    // Only allow fields except bookingFee and photos
    const {
      rent, location, distance, occupancy,
      landlordPhone, paymentNumber, hostelType,
      description, rules, utilities
    } = req.body;

    hostel.rent = rent || hostel.rent;
    hostel.location = location || hostel.location;
    hostel.distance = distance || hostel.distance;
    hostel.occupancy = occupancy || hostel.occupancy;
    hostel.landlordPhone = landlordPhone || hostel.landlordPhone;
    hostel.paymentNumber = paymentNumber || hostel.paymentNumber;
    hostel.hostelType = hostelType || hostel.hostelType;
    if (description !== undefined) hostel.description = description;
    if (rules !== undefined) hostel.rules = rules;
    hostel.utilities = utilities !== undefined ? utilities : hostel.utilities;

    // Reset approval
    hostel.approval = false;

    await hostel.save();
    res.status(200).json({ success: true, hostel });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete hostel
const deleteHostel = async (req, res) => {
  try {
    const hostelId = req.params.id;
    const userId = req.user._id;

    const hostel = await Hostel.findOneAndDelete({ _id: hostelId, uploadedBy: userId });

    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found or not owned by user' });
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

    res.status(200).json({ success: true, message: 'Hostel deleted successfully from database and Cloudinary.' });
  } catch (err) {
    console.error("Error deleting hostel:", err);
    res.status(500).json({ success: false, error: 'Failed to delete hostel. ' + err.message });
  }
};

// --- General House Functions ---

// Get all general houses uploaded by logged-in user
const getMyGeneralHouseUploads = async (req, res) => {
  try {
    const paramUserId = req.params.userId;
    const loggedInUserId = req.user._id.toString();

    if (paramUserId !== loggedInUserId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only view your own uploads.' });
    }

    const houses = await GeneralHouse.find({ uploadedBy: paramUserId });
    res.status(200).json(houses);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Edit general house (reset approval to false)
const editGeneralHouse = async (req, res) => {
  try {
    const houseId = req.params.id;
    const userId = req.user._id;

    const house = await GeneralHouse.findOne({ _id: houseId, uploadedBy: userId });
    if (!house) {
      return res.status(404).json({ success: false, error: 'House not found or not owned by user' });
    }

    const { district, area, cost, description, landlordPhone, uploaderPhone } = req.body;

    house.district = district || house.district;
    house.area = area || house.area;
    house.cost = cost || house.cost;
    house.description = description || house.description;
    house.landlordPhone = landlordPhone || house.landlordPhone;
    house.uploaderPhone = uploaderPhone || house.uploaderPhone;

    // Reset approval status so admin can re-verify
    house.approval = false;

    await house.save();
    res.status(200).json({ success: true, house });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete general house
const deleteGeneralHouse = async (req, res) => {
  try {
    const houseId = req.params.id;
    const userId = req.user._id;

    const house = await GeneralHouse.findOneAndDelete({ _id: houseId, uploadedBy: userId });

    if (!house) {
      return res.status(404).json({ success: false, error: 'House not found or not owned by user' });
    }

    if (house.photos && house.photos.length > 0) {
      const publicIds = house.photos.map(url => {
        const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
        return match ? match[1] : null;
      }).filter(id => id);
      if (publicIds.length > 0) await cloudinary.api.delete_resources(publicIds);
    }

    res.status(200).json({ success: true, message: 'General house deleted successfully.' });
  } catch (err) {
    console.error("Error deleting general house:", err);
    res.status(500).json({ success: false, error: 'Failed to delete house. ' + err.message });
  }
};

module.exports = {
  getMyUploads,
  editHostel,
  deleteHostel,
  getMyGeneralHouseUploads,
  editGeneralHouse,
  deleteGeneralHouse
};
