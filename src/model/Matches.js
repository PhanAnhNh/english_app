const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

    status: {
        type: String,
        enum: ['waiting', 'playing', 'finished'],
        default: 'waiting'
    },

    questions: [
        {
            questionId: mongoose.Schema.Types.ObjectId,
            correctAnswer: String
        }
    ],

    startTime: Date,
    endTime: Date
}, { timestamps: true });

module.exports = mongoose.model('matches', MatchSchema);
