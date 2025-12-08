const cloudinary = require('../config/cloudinary.config');
const streamifier = require('streamifier');

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise<{url: String, publicId: String}>}
 */
const uploadImage = (fileBuffer, folder = 'english_app/images') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 1000, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

/**
 * Upload audio to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise<{url: String, publicId: String, duration: Number}>}
 */
const uploadAudio = (fileBuffer, folder = 'english_app/audio') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'video', // Cloudinary uses 'video' for audio
                format: 'mp3'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    duration: result.duration
                });
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - 'image' or 'video'
 */
const deleteFile = async (publicId, resourceType = 'image') => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
    }
};

module.exports = {
    uploadImage,
    uploadAudio,
    deleteFile
};
