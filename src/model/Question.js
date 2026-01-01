// model/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    content: { type: String, required: true },

    options: {
        A: { type: String, required: true },
        B: { type: String, required: true },
        C: { type: String, required: true },
        D: { type: String, required: true }
    },

    correctAnswer: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: true
    },

    level: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: 'A1'
    },

    // Dùng ở đâu
    mode: {
        type: String,
        enum: ['pvp', 'practice', 'both'],
        default: 'both'
    },

    isActive: {
        type: Boolean,
        default: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('questions', QuestionSchema);
