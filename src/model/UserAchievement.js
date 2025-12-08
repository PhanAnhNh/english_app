const mongoose = require('mongoose');

const UserAchievementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'achievements' },
    unlockedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 }
});

module.exports = mongoose.model('user_achievements', UserAchievementSchema);

