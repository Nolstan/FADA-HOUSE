const cloudinary = require('cloudinary').v2;

/**
 * Extracts Cloudinary public IDs from a list of photo URLs.
 * @param {string[]} photos - Array of Cloudinary photo URLs.
 * @returns {string[]} - Array of public IDs.
 */
function getPublicIds(photos) {
    if (!photos || photos.length === 0) {
        return [];
    }
    // This regex is robust enough to handle different Cloudinary URL formats
    return photos.map(url => {
        const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
        return match ? match[1] : null;
    }).filter(id => id); // Filter out any nulls from malformed URLs
}

/**
 * Deletes a document from MongoDB and its associated images from Cloudinary.
 * This function is generic and can be used for any model that has a 'photos' array.
 *
 * @param {object} options
 * @param {mongoose.Model} options.model - The Mongoose model (e.g., Hostel, GeneralHouse).
 * @param {string} options.documentId - The ID of the document to delete.
 * @param {object} [options.userCheck] - Optional query to ensure ownership (e.g., { uploadedBy: userId }).
 * @returns {Promise<mongoose.Document|null>} - The deleted document, or null if not found or ownership check fails.
 */
async function deleteDocumentAndImages({ model, documentId, userCheck = {} }) {
    const query = { _id: documentId, ...userCheck };

    // 1. Find and delete the document in a single, atomic operation.
    const document = await model.findOneAndDelete(query);

    if (!document) {
        return null; // Document not found or user check failed.
    }

    // 2. If the document had photos, delete them from Cloudinary.
    const publicIds = getPublicIds(document.photos);
    if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
    }

    return document;
}

module.exports = { deleteDocumentAndImages };
