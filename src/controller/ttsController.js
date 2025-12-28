const ttsService = require('../service/ttsService');

/**
 * Get audio for a specific exercise
 * Generates and caches if not exists
 * No auth required - sessionId provides security
 */
const getAudio = async (req, res) => {
    try {
        const { exerciseId } = req.params;
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const { audioData, mimeType } = await ttsService.getOrGenerateAudio(exerciseId, sessionId);

        res.set({
            'Content-Type': mimeType,
            'Content-Length': audioData.length,
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*'
        });

        res.send(audioData);
    } catch (error) {
        console.error('Get Audio Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Prefetch audio for multiple exercises
 * Waits for all audio to be generated before responding
 */
const prefetchAudio = async (req, res) => {
    try {
        const { exerciseIds, sessionId } = req.body;

        if (!sessionId || !Array.isArray(exerciseIds)) {
            return res.status(400).json({
                error: 'sessionId and exerciseIds array are required'
            });
        }

        // WAIT for all audio to be generated
        await ttsService.prefetchAudio(exerciseIds, sessionId);

        res.json({
            message: 'Prefetch completed',
            count: exerciseIds.length
        });
    } catch (error) {
        console.error('Prefetch Audio Error:', error);
        res.status(500).json({ error: error.message });
    }
};



/**
 * Cleanup all audio for a session
 * Called when user finishes or exits exercise
 */
const cleanupSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await ttsService.cleanupSession(sessionId);
        res.json({
            message: 'Session cleaned up',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Cleanup Session Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAudio,
    prefetchAudio,
    cleanupSession
};
