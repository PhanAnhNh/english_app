const Streak = require('../model/Streak');
const mongoose = require('mongoose');

const getMyStreak = async (userId) => {
    // Đảm bảo userId là ObjectId hợp lệ trước khi query
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { current: 0, longest: 0 };
    }

    const streak = await Streak.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    return streak || { current: 0, longest: 0 };
};

const updateStreak = async (userId) => {
    let streak = await Streak.findOne({ userId });

    // Trường hợp 1: Chưa có streak -> Tạo mới
    if (!streak) {
        streak = new Streak({
            userId,
            current: 1,
            longest: 1,
            lastStudyDate: new Date()
        });
    } else {
        // Trường hợp 2: Đã có streak -> Tính toán logic ngày
        const msPerDay = 1000 * 60 * 60 * 24;

        // Lấy mốc 00:00:00 của ngày hôm nay
        const todayZero = new Date().setHours(0, 0, 0, 0);

        const lastDateZero = streak.lastStudyDate
            ? new Date(streak.lastStudyDate).setHours(0, 0, 0, 0)
            : 0;

        // Tính khoảng cách số ngày theo lịch
        const diffDays = Math.floor((todayZero - lastDateZero) / msPerDay);

        if (diffDays === 0) {
            // diffDays = 0: Nghĩa là vẫn trong cùng một ngày -> Không làm gì cả, trả về luôn
            return streak;
        } else if (diffDays === 1) {
            // diffDays = 1: Đúng ngày hôm sau (liên tiếp) -> Tăng streak
            streak.current += 1;
        } else {
            // diffDays > 1: Đã lỡ mất 1 ngày trở lên -> Reset về 1
            streak.current = 1;
        }

        // Cập nhật lại kỷ lục và ngày giờ học mới nhất
        streak.longest = Math.max(streak.longest, streak.current);
        streak.lastStudyDate = new Date(); // Lưu thời gian thực tế hiện tại
    }

    await streak.save();
    return streak;
};

module.exports = {
    getMyStreak,
    updateStreak
};