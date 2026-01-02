// controller/matchController.js
const matchService = require('../service/matchService');

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

module.exports = {
    findMatch,
    submitResult,
    getMatchResult,
    getLatestMatch
};
