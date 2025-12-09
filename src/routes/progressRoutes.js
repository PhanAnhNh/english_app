const express = require('express');
const router = express.Router();
const progressController = require('../controller/progressController');
const authMiddleware = require('../middleware/auth');

router.post('/submit', authMiddleware, progressController.submitExercise);
router.post('/progress', authMiddleware, progressController.updateProgress);
router.get('/learning-stats', authMiddleware, progressController.getLearningStats);
router.get('/progress/detailed', authMiddleware, progressController.getDetailedProgress);
router.get('/user-progress', authMiddleware, progressController.getUserProgress);
router.post('/level-up', authMiddleware, progressController.levelUp);

module.exports = router;

