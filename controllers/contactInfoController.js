const ContactInfo = require('../models/contactInfo');

const CONTACT_INFO_ID = 'main_contact_info';

/**
 * @desc   Get the current contact information
 * @route  GET /api/contact-info
 * @access Public
 */
const getContactInfo = async (req, res) => {
  try {
    let contactInfo = await ContactInfo.findById(CONTACT_INFO_ID);
    if (!contactInfo) {
      // If it doesn't exist, create and return a default one.
      contactInfo = await new ContactInfo({
        whatsappLink: 'https://wa.me/265000000000',
        facebookLink: 'https://facebook.com/your-page',
        phoneNumber: '0990000000 / 0880000000'
      }).save();
    }
    res.status(200).json(contactInfo);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching contact info.' });
  }
};

/**
 * @desc   Update the contact information
 * @route  PUT /api/contact-info
 * @access Private/Superadmin
 */
const updateContactInfo = async (req, res) => {
  try {
    const { whatsappLink, facebookLink, phoneNumber } = req.body;

    if (!whatsappLink || !facebookLink || !phoneNumber) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    // Find and update the single document, or create it if it doesn't exist (upsert).
    const updatedInfo = await ContactInfo.findByIdAndUpdate(
      CONTACT_INFO_ID,
      { whatsappLink, facebookLink, phoneNumber },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Contact information updated successfully.', data: updatedInfo });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ success: false, error: 'Server error while updating contact info.' });
  }
};

module.exports = { getContactInfo, updateContactInfo };