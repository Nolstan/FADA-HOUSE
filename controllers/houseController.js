// controllers/houseController.js
const GeneralHouse = require("../models/general");

// Get all houses (for general listings)
exports.getAllHouses = async (req, res) => {
  try {
    // Base query is for approved houses
    const query = { approval: true };

    const { search, maxPrice, district } = req.query;

    // Add search filter for area (case-insensitive)
    if (search) {
      query.area = new RegExp(search.trim(), 'i');
    }

    // Add max price filter
    if (maxPrice) {
      query.cost = { $lte: Number(maxPrice) };
    }

    // Add district filter
    if (district) {
      query.district = district;
    }

    const houses = await GeneralHouse.find(query).select("district area cost photos");

    const formatted = houses.map((h) => ({
      id: h._id,
      district: h.district,
      area: h.area,
      cost: h.cost,
      photo: h.photos && h.photos.length > 0 ? h.photos[0] : null, // only first photo
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching houses:", err);
    res.status(500).json({ error: "Failed to fetch houses" });
  }
};

// Get single house details
exports.getHouseById = async (req, res) => {
  try {
    // Find the house but exclude sensitive phone numbers from the result
    const house = await GeneralHouse.findById(req.params.id).select('-landlordPhone -uploaderPhone');
    if (!house) {
      return res.status(404).json({ error: "House not found" });
    }
    res.json(house);
  } catch (err) {
    console.error("Error fetching house:", err);
    res.status(500).json({ error: "Failed to fetch house details" });
  }
};
