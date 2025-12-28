const mongoose = require('mongoose');

const VocabularySchema = new mongoose.Schema({
    word: { type: String, required: true, index: true },
    meaning: { type: String, required: true },
    pronunciation: String,
    type: String, // noun, verb...
    level: String, // A, B, C
    topic: {
        type: mongoose.Schema.Types.ObjectId, // <-- Đổi thành ObjectId
        ref: 'Topic',
        required: true
    },
    example: String,
    audioUrl: String,
    imageUrl: String,


    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vocabulary', VocabularySchema);

