const mongoose = require('mongoose');

const UserVocabularySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vocabulary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vocabulary', // Tên Model từ vựng gốc của bạn
        required: true
    },
    status: {
        type: String,
        enum: ['learning', 'memorized', 'review'], // Đang học, Đã thuộc, Cần ôn tập
        default: 'learning'
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    learnedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Đảm bảo 1 user không lưu trùng 1 từ 2 lần
UserVocabularySchema.index({ user: 1, vocabulary: 1 }, { unique: true });

module.exports = mongoose.model('UserVocabulary', UserVocabularySchema);
