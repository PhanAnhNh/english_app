const express = require('express');
const router = express.Router();
const ttsController = require('../controller/ttsController');
const authMiddleware = require('../middleware/auth');

/**
 * TTS Routes
 * Base path: /api/tts
 */

// Get audio for specific exercise (public or authenticated)
router.get('/audio/:exerciseId', ttsController.getAudio);

// Prefetch audio for multiple exercises (authenticated)
router.post('/prefetch', authMiddleware, ttsController.prefetchAudio);

// Cleanup all audio for session (authenticated)
router.delete('/session/:sessionId', authMiddleware, ttsController.cleanupSession);

module.exports = router;
