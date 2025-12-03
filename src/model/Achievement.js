const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    name: String,
    description: String,
    icon: String,
    type: { type: String, enum: ['streak', 'vocab', 'exercise', 'level'] },
    requirement: Number, // số lượng cần đạt
    rewardGems: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('achievements', AchievementSchema);

