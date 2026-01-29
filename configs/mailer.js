const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

/**
 * Centralized Nodemailer transporter using SendGrid.
 * This ensures all parts of the application send email the same way.
 */
const transporter = nodemailer.createTransport(sgTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

module.exports = transporter;