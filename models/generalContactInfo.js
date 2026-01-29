const mongoose = require('mongoose');

const generalContactInfoSchema = new mongoose.Schema({
  _id: { type: String, default: 'general_house_agent_contact' }, // ID for the single document
  whatsappLink: { type: String, required: true, trim: true },
  facebookLink: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true }
});

module.exports = mongoose.model('GeneralContactInfo', generalContactInfoSchema);