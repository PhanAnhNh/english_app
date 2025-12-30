const express = require('express');
const router = express.Router();
const questionController = require('../controller/questionController');
const authMiddleware = require('../middleware/auth');

// Public hoặc User thường có thể lấy danh sách (tùy logic của bạn)
router.get('/', authMiddleware, questionController.getQuestions);

// Chỉ Admin mới được Thêm/Sửa/Xóa
router.post('/', authMiddleware, questionController.createQuestion);
router.put('/:id', authMiddleware, questionController.updateQuestion);
router.delete('/:id', authMiddleware, questionController.deleteQuestion);

module.exports = router;