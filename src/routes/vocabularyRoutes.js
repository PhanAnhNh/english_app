const express = require('express');
const router = express.Router();
const vocabularyController = require('../controller/vocabularyController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/vocab', authMiddleware, vocabularyController.getVocabularies);
router.get('/vocab/types', vocabularyController.getVocabularyTypes); // Public endpoint
router.get('/detail_vocab/:id', authMiddleware, vocabularyController.getVocabularyById);
router.post('/vocab', authMiddleware, adminMiddleware, vocabularyController.createVocabulary);
router.put('/vocab/:id', authMiddleware, adminMiddleware, vocabularyController.updateVocabulary);
router.delete('/vocab/:id', authMiddleware, adminMiddleware, vocabularyController.deleteVocabulary);

module.exports = router;

