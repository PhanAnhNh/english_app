const Achievement = require('../model/Achievement');
const UserAchievement = require('../model/UserAchievement');
const Streak = require('../model/Streak');
const User = require('../model/User');

const checkAchievements = async (userId) => {
    const unlocked = [];

    // Check streak achievements
    const streak = await Streak.findOne({ userId });
    if (streak) {
        const streakAchievements = await Achievement.find({ type: 'streak' });
        for (let achievement of streakAchievements) {
            if (streak.current >= achievement.requirement) {
                const exists = await UserAchievement.findOne({ userId, achievementId: achievement._id });
                if (!exists) {
                    await UserAchievement.create({ userId, achievementId: achievement._id });

                    // Thưởng gems
                    await User.findByIdAndUpdate(userId, {
                        $inc: { gems: achievement.rewardGems }
                    });

                    unlocked.push(achievement);
                }
            }
        }
    }

    return { unlocked };
};

module.exports = {
    checkAchievements
};

