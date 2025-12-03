const express = require('express');
const router = express.Router();
const searchController = require('../controller/searchController');
const authMiddleware = require('../middleware/auth');

router.get('/search', authMiddleware, searchController.search);
router.post('/send-reminder', authMiddleware, searchController.sendReminder);
router.get('/leaderboard', authMiddleware, searchController.getLeaderboard);

module.exports = router;

