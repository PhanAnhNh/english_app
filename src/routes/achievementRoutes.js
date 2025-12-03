const express = require('express');
const router = express.Router();
const achievementController = require('../controller/achievementController');
const authMiddleware = require('../middleware/auth');

router.post('/check-achievements', authMiddleware, achievementController.checkAchievements);

module.exports = router;

