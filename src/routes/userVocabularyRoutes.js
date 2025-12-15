const express = require('express');
const router = express.Router();

// 1. Đảm bảo đường dẫn import Controller chính xác
const userVocabularyController = require('../controller/userVocabularyController');

const authMiddleware = require('../middleware/auth');

router.post('/add', authMiddleware, userVocabularyController.addToDictionary);

router.get('/', authMiddleware, userVocabularyController.getUserDictionary);

// Chức năng: Cập nhật trạng thái học tập của từ vựng
router.put('/status', authMiddleware, userVocabularyController.updateVocabStatus);

// Chức năng: Xóa từ vựng khỏi từ điển cá nhân (id là userVocabId)
router.delete('/:id', authMiddleware, userVocabularyController.deleteFromDictionary);


module.exports = router;