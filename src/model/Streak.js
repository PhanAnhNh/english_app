const mongoose = require('mongoose');

const StreakSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', unique: true },
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastStudyDate: Date
});

module.exports = mongoose.model('streaks', StreakSchema);

