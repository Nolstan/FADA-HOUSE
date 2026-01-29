const Hostel = require('../models/hostels');

exports.getHostelsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const { search, maxPrice, occupancy, genderType } = req.query;

    // Build a dynamic query object
    const filter = {
      approval: true,
      location: new RegExp(`^${city}`, 'i') // Ensures we only get hostels from the correct city
    };

    if (search) {
      // Adds a regex to search for the term anywhere in the location string
      filter.location = new RegExp(`${city}.*${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i');
    }
    if (maxPrice && !isNaN(maxPrice)) {
      filter.rent = { $lte: parseInt(maxPrice, 10) };
    }
    if (occupancy && !isNaN(occupancy)) {
      filter.occupancy = parseInt(occupancy, 10);
    }
    if (genderType && genderType !== 'any') {
      filter.hostelType = genderType;
    }

    const hostels = await Hostel.find(filter);

    const formatted = hostels
      .map(h => {
        const [mainCity, area] = h.location.split(',').map(s => s.trim());
        return {
          _id: h._id,
          rent: h.rent,
          occupancy: h.occupancy,
          hostelType: h.hostelType,
          photo: h.photos?.[0] || '/public/image/default-hostel.jpg',
          location: area || h.location
        };
      })

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ error: 'Server error while fetching hostels' });
  }
};




exports.getHostelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hostel = await Hostel.findById(id);

    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }

    res.json({
      _id: hostel._id,
      rent: hostel.rent,
      occupancy: hostel.occupancy,
      hostelType: hostel.hostelType,
      photos: hostel.photos || [],
      location: hostel.location,
      description: hostel.description || '',
      approval: hostel.approval,
      rules: hostel.rules || '',
      landlordPhone: hostel.landlordPhone || '',
      distance: hostel.distance,
      utilities: hostel.utilities,
      paymentNumber: hostel.paymentNumber
    });
  } catch (error) {
    console.error('Error fetching hostel details:', error);
    res.status(500).json({ error: 'Server error while fetching hostel details' });
  }
};
