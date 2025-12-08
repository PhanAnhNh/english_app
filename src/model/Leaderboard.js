const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    xp: Number,
    level: String,
    rank: Number,
    week: Number, // tuần trong năm
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('leaderboards', LeaderboardSchema);

