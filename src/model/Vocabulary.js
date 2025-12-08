const mongoose = require('mongoose');

const VocabularySchema = new mongoose.Schema({
    word: { type: String, required: true, index: true },
    meaning: { type: String, required: true },
    pronunciation: String,
    type: String, // noun, verb...
    level: String, // A, B, C
    topic: String,
    example: String,
    audioUrl: String,
    imageUrl: String,
    cloudinaryAudioId: String, // Public ID để xóa file audio trên Cloudinary
    cloudinaryImageId: String, // Public ID để xóa file image trên Cloudinary
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('vocabularies', VocabularySchema);

