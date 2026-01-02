// service/matchService.js
const mongoose = require('mongoose');
const Match = require('../model/Matches');
const MatchResult = require('../model/MatchResult');
const User = require('../model/User');
const Exercise = require('../model/Exercise');
const achievementService = require('./achievementService');

const QUESTION_COUNT = 5;

// ==========================================
// HELPER: Lấy câu hỏi (Dùng chung cho PvP và Bot)
// ==========================================
const fetchMatchQuestions = async (level) => {
    // 1. Lấy câu hỏi đúng Level
    let questions = await Exercise.aggregate([
        {
            $match: {
                mode: 'pvp',
                isActive: true,
                level: level // Lọc theo level
            }
        },
        { $sample: { size: QUESTION_COUNT } }
    ]);

    // 2. Fallback: Nếu không đủ câu hỏi đúng level, lấy random
    if (questions.length < QUESTION_COUNT) {
        const needed = QUESTION_COUNT - questions.length;
        const fallbackQuestions = await Exercise.aggregate([
            {
                $match: {
                    mode: 'pvp',
                    isActive: true,
                    _id: { $nin: questions.map(q => q._id) } // Tránh trùng lặp
                }
            },
            { $sample: { size: needed } }
        ]);
        questions = questions.concat(fallbackQuestions);
    }

    return questions;
};

// ==========================================
// HELPER: Lấy hoặc tạo Bot User
// ==========================================
const getSystemBot = async () => {
    // Tìm user có username là 'bot_system' hoặc tạo mới nếu chưa có
    let bot = await User.findOne({ username: 'bot_ai' });
    if (!bot) {
        bot = await User.create({
            username: 'bot_ai',
            email: 'bot@system.com',
            password: 'botpassword', // Password giả
            avatarUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png', // Avatar Robot
            isAdmin: false
        });
    }
    return bot;
};

// ==========================================
// 1. Logic Tìm trận đấu (Người vs Người)
// ==========================================
const findMatch = async (userId, level = 'A1') => {
    // Tìm phòng đang waiting VÀ cùng Level
    let match = await Match.findOne({
        status: 'waiting',
        level: level // Quan trọng: Chỉ join phòng cùng level
    });

    // --- TRƯỜNG HỢP 1: Tạo phòng mới nếu không có ---
    if (!match) {
        match = await Match.create({
            player1: userId,
            status: 'waiting',
            level: level, // Lưu level để người sau tìm thấy
            startTime: null
        });
        return { status: 'waiting', matchId: match._id };
    }

    // --- TRƯỜNG HỢP 2: Join phòng có sẵn ---
    // Check xem player1 có phải chính mình không (tránh tự join phòng mình tạo)
    if (match.player1.toString() === userId.toString()) {
        return { status: 'waiting', matchId: match._id };
    }

    // Set player 2
    match.player2 = userId;
    match.status = 'playing';
    match.startTime = new Date();

    // Lấy câu hỏi
    const questions = await fetchMatchQuestions(level);

    // Lưu câu hỏi vào Match (chỉ ID và đáp án để check server-side)
    match.questions = questions.map(q => ({
        questionId: q._id,
        correctAnswer: q.correctAnswer
    }));

    await match.save();

    // Trả về dữ liệu
    return {
        status: 'matched',
        matchId: match._id,
        questions: questions // Trả về full object cho Client render
    };
};

// ==========================================
// 2. Logic Ghép với BOT (Khi đợi quá lâu)
// ==========================================
const joinWithBot = async (matchId) => {
    const match = await Match.findById(matchId);

    // Nếu match không còn waiting (đã có người vào hoặc hủy), return
    if (!match || match.status !== 'waiting') {
        return { status: 'failed', message: 'Match not available or already started' };
    }

    // Lấy thông tin Bot
    const botUser = await getSystemBot();

    // Cập nhật Match thành Bot Match
    match.player2 = botUser._id;
    match.status = 'playing';
    match.startTime = new Date();

    // Đánh dấu đây là trận đấu với Bot (để logic tính điểm xử lý riêng nếu cần)
    // Nếu Schema Match chưa có field isBotMatch, bạn nên thêm vào, hoặc dựa vào ID bot

    // Lấy câu hỏi
    const questions = await fetchMatchQuestions(match.level || 'A1');

    match.questions = questions.map(q => ({
        questionId: q._id,
        correctAnswer: q.correctAnswer
    }));

    await match.save();

    return {
        status: 'matched_with_bot',
        matchId: match._id,
        player2: botUser, // Trả về info bot để hiển thị avatar/tên
        questions: questions
    };
};

// ==========================================
// 3. Logic Nộp bài & Tính điểm
// ==========================================
const saveMatchResultDirectly = async (userId, matchId, totalScore, correctCount) => {
    try {
        const match = await Match.findById(matchId);
        if (!match) return false;

        // Lưu kết quả của người chơi hiện tại
        await MatchResult.create({
            matchId,
            userId,
            score: totalScore,
            correctCount: correctCount || 0,
            timeUsed: 0 // Có thể tính: new Date() - match.startTime
        });

        // Cộng thưởng cho User
        const gemsReward = totalScore > 0 ? 5 : 0;
        await User.findByIdAndUpdate(userId, {
            $inc: { xp: totalScore, gems: gemsReward }
        });

        // Check achievement
        try {
            await achievementService.checkAchievements(userId);
        } catch (e) { console.log("Achiev error:", e.message); }

        // --- XỬ LÝ BOT ---
        // Nếu player2 là Bot và người nộp bài là Player1 (hoặc ngược lại)
        // Ta cần tạo kết quả giả cho Bot ngay lập tức để trận đấu kết thúc
        const botUser = await getSystemBot();
        const isBotMatch = (match.player2 && match.player2.toString() === botUser._id.toString());

        if (isBotMatch && userId.toString() !== botUser._id.toString()) {
            await generateBotResult(match, botUser._id);
        }

        return true;
    } catch (error) {
        console.error("Save match result error:", error);
        return false;
    }
};

// Hàm nội bộ: Sinh kết quả ngẫu nhiên cho Bot
const generateBotResult = async (match, botId) => {
    // Kiểm tra xem bot đã có kết quả chưa (tránh duplicate)
    const existingResult = await MatchResult.findOne({ matchId: match._id, userId: botId });
    if (existingResult) return;

    // Logic Random điểm Bot:
    // Bot sẽ trả lời đúng khoảng 40% - 90% tùy may mắn (hoặc dựa vào level match)
    const totalQuestions = match.questions.length;

    // Random số câu đúng (Ví dụ: từ 2 đến 5 câu)
    const minCorrect = Math.floor(totalQuestions * 0.4);
    const maxCorrect = totalQuestions;
    const botCorrectCount = Math.floor(Math.random() * (maxCorrect - minCorrect + 1)) + minCorrect;

    // Giả sử mỗi câu 10 điểm
    const botScore = botCorrectCount * 10;

    await MatchResult.create({
        matchId: match._id,
        userId: botId,
        score: botScore,
        correctCount: botCorrectCount,
        timeUsed: 0
    });
};

// ==========================================
// 4. Lấy kết quả trận đấu
// ==========================================
const getMatchResult = async (matchId) => {
    return MatchResult.find({ matchId })
        .populate('userId', 'username avatarUrl') // Populate lấy tên và ảnh
        .sort({ score: -1 }); // Điểm cao xếp trước
};

module.exports = {
    findMatch,
    joinWithBot, // <-- Export thêm hàm này
    getMatchResult,
    saveMatchResultDirectly
};