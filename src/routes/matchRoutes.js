// routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const matchController = require('../controller/matchController');
const authMiddleware = require('../middleware/auth');

router.post('/find', authMiddleware, matchController.findMatch);
router.post('/submit', authMiddleware, matchController.submitResult);
router.get('/:id/result', authMiddleware, matchController.getMatchResult);
router.get('/latest', authMiddleware, matchController.getLatestMatch);
router.get('/history', authMiddleware, matchController.getMatchHistory);


module.exports = router;
