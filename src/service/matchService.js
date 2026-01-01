// service/matchService.js
const Match = require('../model/Matches');
const MatchResult = require('../model/MatchResult');
const User = require('../model/User');
const Question = require('../model/Question'); // bạn đã có
const achievementService = require('./achievementService');

const QUESTION_COUNT = 5;

const findMatch = async (userId) => {
    // Tìm phòng đang chờ
    let match = await Match.findOne({ status: 'waiting' });

    if (!match) {
        match = await Match.create({
            player1: userId,
            status: 'waiting'
        });
        return { status: 'waiting', matchId: match._id };
    }

    // Ghép người thứ 2
    match.player2 = userId;
    match.status = 'playing';

    // Lấy câu hỏi
    const questions = await Question.aggregate([{ $sample: { size: QUESTION_COUNT } }]);

    match.questions = questions.map(q => ({
        questionId: q._id,
        correctAnswer: q.correctAnswer
    }));

    match.startTime = new Date();
    await match.save();

    return {
        status: 'matched',
        matchId: match._id,
        questions
    };
};

const submitResult = async (userId, matchId, answers, timeUsed) => {
    const match = await Match.findById(matchId);
    if (!match) throw new Error('Match không tồn tại');

    let correct = 0;
    match.questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) correct++;
    });

    const score = correct * 10;

    await MatchResult.create({
        matchId,
        userId,
        score,
        correctCount: correct,
        timeUsed
    });

    // Cộng XP + Gems
    await User.findByIdAndUpdate(userId, {
        $inc: { xp: score, gems: 5 }
    });

    // Check achievement (tái sử dụng code bạn đã có)
    await achievementService.checkAchievements(userId);

    // Nếu đủ 2 người thì kết thúc match
    const results = await MatchResult.find({ matchId });
    if (results.length === 2) {
        match.status = 'finished';
        match.endTime = new Date();
        await match.save();
    }

    return { score, correct };
};

const getMatchResult = async (matchId) => {
    return MatchResult.find({ matchId }).populate('userId', 'username avatarUrl');
};

module.exports = {
    findMatch,
    submitResult,
    getMatchResult
};
