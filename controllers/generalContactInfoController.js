const GeneralContactInfo = require('../models/generalContactInfo');

const CONTACT_ID = 'general_house_agent_contact';

/**
 * @desc   Get the general house agent contact information
 * @route  GET /api/general-contact-info
 * @access Public
 */
const getGeneralContactInfo = async (req, res) => {
  try {
    let contactInfo = await GeneralContactInfo.findById(CONTACT_ID);
    if (!contactInfo) {
      // If it doesn't exist, create and return a default one.
      contactInfo = await new GeneralContactInfo({
        _id: CONTACT_ID,
        whatsappLink: 'https://wa.me/265000000000',
        facebookLink: 'https://facebook.com/your-page',
        phoneNumber: '0990000000 / 0880000000'
      }).save();
    }
    res.status(200).json(contactInfo);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching general contact info.' });
  }
};

/**
 * @desc   Update the general house agent contact information
 * @route  PUT /api/general-contact-info
 * @access Private/Superadmin
 */
const updateGeneralContactInfo = async (req, res) => {
  try {
    const { whatsappLink, facebookLink, phoneNumber } = req.body;
    if (!whatsappLink || !facebookLink || !phoneNumber) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    const updatedInfo = await GeneralContactInfo.findByIdAndUpdate(CONTACT_ID, { whatsappLink, facebookLink, phoneNumber }, { new: true, upsert: true, runValidators: true });
    res.status(200).json({ success: true, message: 'General house agent contact updated successfully.', data: updatedInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating general contact info.' });
  }
};

module.exports = { getGeneralContactInfo, updateGeneralContactInfo };