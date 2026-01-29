/**
 * Centralized HTML email templates.
 */

/**
 * Generates a professional-looking HTML email for OTPs.
 * @param {string} otp The One-Time Password.
 * @param {string} title The main title for the email (e.g., "Account Verification").
 * @param {string} appName The name of the application.
 * @param {string} physicalAddress The physical address for the footer.
 * @returns {string} The complete HTML for the email.
 */
const getOtpTemplate = (otp, title, appName, physicalAddress) => {
    const addressHtml = physicalAddress.replace(/, /g, '<br>');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
            .header h1 { color: #0056b3; margin: 0; }
            .content { padding: 20px 0; }
            .content p { margin: 0 0 15px; }
            .otp-code { font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 5px; padding: 15px; background-color: #e9ecef; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; font-size: 0.8em; color: #777; padding-top: 20px; border-top: 1px solid #ddd; }
            .footer p { margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${appName}</h1>
            </div>
            <div class="content">
                <h2>${title || 'Your One-Time Code'}</h2>
                <p>Please use the following One-Time Password (OTP) to complete your action. This code is valid for 10-15 minutes.</p>
                <div class="otp-code">${otp}</div>
                <p>If you did not request this code, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>${appName}</p>
                <p>${addressHtml}</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getOtpTemplate };