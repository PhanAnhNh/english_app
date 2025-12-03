const express = require('express');
const router = express.Router();
const streakController = require('../controller/streakController');
const authMiddleware = require('../middleware/auth');

router.get('/my-streak', authMiddleware, streakController.getMyStreak);
router.post('/streak', authMiddleware, streakController.updateStreak);

module.exports = router;

