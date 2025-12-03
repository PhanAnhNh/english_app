const Streak = require('../model/Streak');

const getMyStreak = async (userId) => {
    const streak = await Streak.findOne({ userId });
    return streak || { current: 0, longest: 0 };
};

const updateStreak = async (userId) => {
    const todayStr = new Date().toDateString();

    let streak = await Streak.findOne({ userId });
    if (!streak) {
        streak = new Streak({ userId, current: 1, longest: 1, lastStudyDate: new Date() });
    } else {
        const lastStr = streak.lastStudyDate ? new Date(streak.lastStudyDate).toDateString() : null;
        if (lastStr !== todayStr) {
            const lastDate = new Date(streak.lastStudyDate);
            const today = new Date();
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) streak.current += 1;
            else streak.current = 1;

            streak.longest = Math.max(streak.longest, streak.current);
            streak.lastStudyDate = new Date();
        }
    }
    await streak.save();
    return streak;
};

module.exports = {
    getMyStreak,
    updateStreak
};

