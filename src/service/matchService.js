// service/matchService.js
const Match = require('../model/Matches');
const MatchResult = require('../model/MatchResult');
const User = require('../model/User');
const Exercise = require('../model/Exercise'); // ✅ Đổi từ Question sang Exercise
const achievementService = require('./achievementService');

const QUESTION_COUNT = 5;

const findMatch = async (userId, level = 'A1') => {
    // 1. Tìm phòng đang chờ (status: waiting) và cùng Level (nếu muốn)
    // Bạn có thể mở rộng schema Match để lưu level của phòng
    let match = await Match.findOne({ status: 'waiting' });

    // Nếu không có phòng chờ, tạo phòng mới
    if (!match) {
        match = await Match.create({
            player1: userId,
            status: 'waiting',
            // Có thể lưu thêm level vào Match để người sau join đúng level
            // level: level 
        });
        return { status: 'waiting', matchId: match._id };
    }

    // 2. Nếu tìm thấy phòng, người này là player2
    // Kiểm tra xem player2 có trùng player1 không
    if (match.player1.toString() === userId.toString()) {
        return { status: 'waiting', matchId: match._id };
    }

    match.player2 = userId;
    match.status = 'playing';
    match.startTime = new Date();

    // 3. Lấy câu hỏi từ Exercise (Mode PVP, Active, đúng Level)
    const questions = await Exercise.aggregate([
        {
            $match: {
                mode: 'pvp',
                isActive: true,
                level: level // Lọc theo level người chơi chọn
            }
        },
        { $sample: { size: QUESTION_COUNT } }
    ]);

    // Nếu không đủ câu hỏi, lấy random không cần level (fallback)
    if (questions.length === 0) {
        const fallbackQuestions = await Exercise.aggregate([
            { $match: { mode: 'pvp', isActive: true } },
            { $sample: { size: QUESTION_COUNT } }
        ]);
        questions.push(...fallbackQuestions);
    }

    // Lưu danh sách câu hỏi vào Match (chỉ lưu ID và đáp án đúng để check server-side)
    match.questions = questions.map(q => ({
        questionId: q._id,
        correctAnswer: q.correctAnswer
    }));

    await match.save();

    // Trả về full info câu hỏi cho Client hiển thị (ẩn đáp án đúng nếu cần bảo mật cao)
    // Ở đây trả về nguyên object để client render
    return {
        status: 'matched',
        matchId: match._id,
        questions: questions
    };
};

/**
 * Nộp kết quả sau khi kết thúc trận
 */
const submitResult = async (userId, matchId, answers, timeUsed) => {
    const match = await Match.findById(matchId);
    if (!match) throw new Error('Match không tồn tại');

    let correct = 0;

    // So sánh đáp án gửi lên với đáp án trong DB
    // answers là mảng string: ['A', 'B', 'C', ...]
    match.questions.forEach((q, index) => {
        if (answers[index] && answers[index] === q.correctAnswer) {
            correct++;
        }
    });

    const score = correct * 10; // 10 điểm 1 câu

    // Tạo bản ghi kết quả
    await MatchResult.create({
        matchId,
        userId,
        score,
        correctCount: correct,
        timeUsed: timeUsed || 0
    });

    // Cộng XP + Gems cho User
    await User.findByIdAndUpdate(userId, {
        $inc: { xp: score, gems: 5 }
    });

    // Check achievement
    try {
        await achievementService.checkAchievements(userId);
    } catch (err) {
        console.error('Check achievement error:', err.message);
    }

    // Kiểm tra xem cả 2 người đã nộp bài chưa để đóng Match
    const results = await MatchResult.find({ matchId });

    // Nếu match này có 2 người chơi và đã có 2 kết quả => Kết thúc
    if (match.player2 && results.length >= 2) {
        match.status = 'finished';
        match.endTime = new Date();
        await match.save();
    }
    // Nếu match đánh với máy hoặc logic khác thì tuỳ chỉnh tại đây

    return { score, correct, totalQuestions: match.questions.length };
};

const getMatchResult = async (matchId) => {
    return MatchResult.find({ matchId })
        .populate('userId', 'username avatarUrl')
        .sort({ score: -1 }); // Sắp xếp ai điểm cao lên trước
};

module.exports = {
    findMatch,
    submitResult,
    getMatchResult
};