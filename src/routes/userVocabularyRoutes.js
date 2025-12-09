const express = require('express');
const router = express.Router();

// 1. Đảm bảo đường dẫn import Controller chính xác
const userVocabularyController = require('../controller/userVocabularyController');

const authMiddleware = require('../middleware/auth');

// --- ROUTE TỪ ĐIỂN CÁ NHÂN ---

// POST /api/user-vocabulary/add
// Chức năng: Thêm từ vựng vào từ điển cá nhân
router.post('/add', authMiddleware, userVocabularyController.addToDictionary);

// GET /api/user-vocabulary/
// Chức năng: Lấy danh sách từ vựng cá nhân
router.get('/', authMiddleware, userVocabularyController.getUserDictionary);

// Chức năng: Cập nhật trạng thái học tập của từ vựng
router.put('/status', authMiddleware, userVocabularyController.updateVocabStatus);

// Chức năng: Xóa từ vựng khỏi từ điển cá nhân (id là userVocabId)
router.delete('/:id', authMiddleware, userVocabularyController.deleteFromDictionary);


module.exports = router;