

const cloudinary = require('../configs/cloudinary');
const fs = require('fs');
const Hostel = require('../models/hostels');

exports.uploadHostel = async (req, res) => {
  try {
    const {
      rent,
      bookingFee,
      location,
      distance,
      occupancy,
      landlordPhone,
      paymentNumber,
      hostelType,
      description,
      rules,
      utilities
    } = req.body;

    // Validate required fields
    const requiredFields = { rent, bookingFee, location, occupancy, landlordPhone, paymentNumber, hostelType };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: missingFields
      });
    }

    // Validate photos
    if (!req.files?.photos || req.files.photos.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one photo is required' });
    }
    if (req.files.photos.length > 5) {
      return res.status(400).json({ success: false, error: 'Maximum of 5 photos allowed' });
    }

    // Upload photos to Cloudinary with retry
    async function safeUpload(file) {
      try {
        return await cloudinary.uploader.upload(file.path, {
          folder: 'hostels',
          resource_type: 'image',
          timeout: 120000 // 2 min timeout
        });
      } catch (err) {
        console.warn('Retrying upload for', file.originalname);
        return await cloudinary.uploader.upload(file.path, {
          folder: 'hostels',
          resource_type: 'image',
          timeout: 120000
        });
      }
    }

    const totalFiles = req.files.photos.length;
    const uploadedPhotos = await Promise.all(
      req.files.photos.map(async (file, index) => {
        try {
          const result = await safeUpload(file);
          if (!result?.secure_url) throw new Error('Cloudinary upload failed');
          return result.secure_url;
        } catch (err) {
          throw new Error(`Failed to upload ${file.originalname}: ${err.message}`);
        } finally {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      })
    );

    // Create hostel record
    const newHostel = new Hostel({
      rent,
      bookingFee,
      location,
      distance,
      occupancy,
      landlordPhone,
      paymentNumber,
      photos: uploadedPhotos,
      hostelType,
      description,
      rules,
      utilities: utilities === 'on' || utilities === 'true',
      uploadedBy: req.user._id,
      approval: false 
    });

    await newHostel.save();

    res.status(201).json({
      success: true,
      message: 'Room uploaded successfully! It will be visible after admin approval.',
      data: {
        id: newHostel._id,
        photos: newHostel.photos,
        location: newHostel.location,
        rent: newHostel.rent
      }
    });

  } catch (error) {
    console.error('Upload error:', error);

    if (req.files?.photos) {
      for (const file of req.files.photos) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Failed to upload room. Please try again.'
    });
  }
};
