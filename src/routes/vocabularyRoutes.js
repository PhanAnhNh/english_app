const express = require('express');
const router = express.Router();
const vocabularyController = require('../controller/vocabularyController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload.middleware');

router.get('/vocab', authMiddleware, vocabularyController.getVocabularies);
router.get('/detail_vocab/:id', authMiddleware, vocabularyController.getVocabularyById);
router.post('/vocab', authMiddleware, adminMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), vocabularyController.createVocabulary);
router.put('/vocab/:id', authMiddleware, adminMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), vocabularyController.updateVocabulary);
router.delete('/vocab/:id', authMiddleware, adminMiddleware, vocabularyController.deleteVocabulary);

module.exports = router;

