const Vocabulary = require('../model/Vocabulary');
const Grammar = require('../model/Grammar');
const User = require('../model/User');
const Streak = require('../model/Streak');
const Notification = require('../model/Notification');

const search = async (query, type = 'all') => {
    if (!query) {
        throw new Error('Thiếu từ khóa tìm kiếm');
    }

    const results = {};

    if (type === 'all' || type === 'vocab') {
        results.vocabularies = await Vocabulary.find({
            $or: [
                { word: { $regex: query, $options: 'i' } },
                { meaning: { $regex: query, $options: 'i' } },
                { example: { $regex: query, $options: 'i' } }
            ]
        }).limit(10);
    }

    if (type === 'all' || type === 'grammar') {
        results.grammars = await Grammar.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        }).limit(10);
    }

    return results;
};

const sendReminder = async () => {
    // Gửi reminder cho users không học trong 2 ngày
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const inactiveUsers = await Streak.find({
        lastStudyDate: { $lt: twoDaysAgo }
    }).populate('userId');

    for (let streak of inactiveUsers) {
        await Notification.create({
            userId: streak.userId._id,
            title: 'Nhắc nhở học tập 📚',
            message: 'Bạn đã bỏ lỡ 2 ngày học! Hãy quay lại để giữ streak nhé!',
            type: 'reminder'
        });
    }

    return { message: `Đã gửi reminder cho ${inactiveUsers.length} users` };
};

const getLeaderboard = async (type = 'weekly', limit = 50) => {
    const leaderboard = await User.find()
        .select('fullname xp level avatarUrl')
        .sort({ xp: -1 })
        .limit(parseInt(limit));

    // Thêm rank
    const ranked = leaderboard.map((user, index) => ({
        ...user.toObject(),
        rank: index + 1
    }));

    return ranked;
};

module.exports = {
    search,
    sendReminder,
    getLeaderboard
};

