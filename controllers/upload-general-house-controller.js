const cloudinary = require("cloudinary").v2;
const GeneralHouse = require("../models/general"); 


exports.uploadHouse = async (req, res) => {
  try {
    const { district, area, cost, description, landlordPhone, uploaderPhone } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No photos uploaded" });
    }

    // Upload all files to Cloudinary
    const photoUrls = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "houses" },
            (err, result) => {
              if (err) return reject(err);
              resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });
      })
    );

    // Save to MongoDB
    const newHouse = new GeneralHouse({
      district,
      area,
      cost,
      description,
      landlordPhone,
      uploaderPhone,
      photos: photoUrls,
      uploadedBy: req.user._id, // Save the ID of the logged-in user
      approval: false, // Default to not approved
    });

    await newHouse.save();

    res.status(201).json({
      message: "House uploaded successfully! It will be visible after admin approval.",
      data: newHouse,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload house" });
  }
};
