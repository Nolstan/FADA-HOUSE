const mongoose = require('mongoose');

const CONTACT_INFO_ID = 'main_contact_info';

const contactInfoSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: CONTACT_INFO_ID
  },
  whatsappLink: {
    type: String,
    trim: true,
    required: true
  },
  facebookLink: {
    type: String,
    trim: true,
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    required: true
  }
});

module.exports = mongoose.model('ContactInfo', contactInfoSchema);