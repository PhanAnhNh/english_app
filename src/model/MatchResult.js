// model/MatchResult.js
const mongoose = require('mongoose');

const MatchResultSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'matches'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    score: Number,
    correctCount: Number,
    timeUsed: Number
}, { timestamps: true });

module.exports = mongoose.model('match_results', MatchResultSchema);
