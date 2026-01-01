const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    skill: String, // vocab, grammar, listening
    type: String, // multiple_choice, fill_in_blank
    questionText: String,
    audioUrl: String,
    options: [{ text: String, isCorrect: Boolean }], // Mảng object đáp án
    correctAnswer: String,
    explanation: String,
    level: String,
    isActive: {
        type: Boolean,
        default: true
    },
    mode: {
        type: String,
        enum: ['pvp', 'practice'],
        default: 'practice'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('exercises', ExerciseSchema);

