// controller/matchController.js
const matchService = require('../service/matchService');
const Match = require('../model/Matches');

const findMatch = async (req, res) => {
    try {
        const result = await matchService.findMatch(req.user.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const submitResult = async (req, res) => {
    try {
        const { matchId, answers, timeUsed } = req.body;
        const result = await matchService.submitResult(
            req.user.id,
            matchId,
            answers,
            timeUsed
        );
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

const getMatchResult = async (req, res) => {
    try {
        const result = await matchService.getMatchResult(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(404).json({ error: e.message });
    }
};
const getLatestMatch = async (req, res) => {
    try {
        // Bây giờ đã có biến Match, dòng này sẽ chạy đúng
        const match = await Match.findOne({
            $or: [
                { player1: req.user.id },
                { player2: req.user.id }
            ],
            status: 'finished'
        }).sort({ endTime: -1 });

        if (!match) {
            return res.json({ matchId: null });
        }

        res.json({ matchId: match._id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const MatchResult = require('../model/MatchResult');

const getMatchHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const matches = await Match.find({
            $or: [
                { player1: userId },
                { player2: userId }
            ],
            status: 'finished'
        })
            .populate('player1', 'username avatarUrl')
            .populate('player2', 'username avatarUrl')
            .sort({ endTime: -1 })
            .lean();

        // Lấy toàn bộ kết quả cho các match
        const matchIds = matches.map(m => m._id);

        const results = await MatchResult.find({
            matchId: { $in: matchIds }
        }).populate('userId', 'username');

        // Gộp kết quả vào từng match
        const history = matches.map(match => {
            const matchResults = results.filter(
                r => r.matchId.toString() === match._id.toString()
            );

            return {
                ...match,
                results: matchResults.map(r => ({
                    userId: r.userId._id,
                    username: r.userId.username,
                    score: r.score,
                    correctCount: r.correctCount
                }))
            };
        });

        res.json(history);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


module.exports = {
    findMatch,
    submitResult,
    getMatchResult,
    getLatestMatch,
    getMatchHistory
};
