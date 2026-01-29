const mongoose = require('mongoose');

function arrayLimit(val) {
  return val.length <= 5;
}

const hostelSchema = new mongoose.Schema({
  rent: { 
    type: Number, 
    required: true 
  },
  bookingFee: { 
    type: Number, 
    required: true, 
    immutable: true // can't change after creation 
  },
  location: { 
    type: String, 
    required: true, 
    trim: true 
  },
  distance: { 
    type: String, 
    default: '' 
  },
  occupancy: { 
    type: Number, 
    required: true 
  },
  landlordPhone: { 
    type: String, 
    required: true, 
    match: [/^\+?[0-9]{7,15}$/, 'Please provide a valid phone number'] 
  },
  paymentNumber: { 
    type: String, 
    required: true, 
    match: [/^\+?[0-9]{7,15}$/, 'Please provide a valid phone number'] 
  },
  photos: { 
    type: [String], // Cloudinary URLs
    validate: [arrayLimit, '{PATH} exceeds the limit of 5'], 
    required: true 
  },
  hostelType: { 
    type: String, 
    enum: ['male', 'female', 'both'], 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  rules: { 
    type: String, 
    default: '' 
  },
  utilities: { 
    type: Boolean, 
    default: false 
  },
  approval: { 
    type: Boolean, 
    default: false 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true // ensures hostel always linked to a user
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  versionKey: false //  removes "__v"
});

// Add indexes for common query fields. This will dramatically improve performance
// for filtering and searching on the university pages.
hostelSchema.index({ location: 1, approval: 1 });
hostelSchema.index({ approval: 1, rent: 1 });
hostelSchema.index({ approval: 1, occupancy: 1 });
hostelSchema.index({ approval: 1, hostelType: 1 });
hostelSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Hostel', hostelSchema);
