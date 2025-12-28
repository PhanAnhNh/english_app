const express = require('express');
const router = express.Router();
const grammarExerciseController = require('../controller/grammarExerciseController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Route tạo bài tập mới (Dành cho Admin)
router.post('/grammar-exercises/create', authMiddleware, adminMiddleware, grammarExerciseController.createExercise);

// Route: GET /api/grammar-exercises?grammarId=...
router.get('/grammar-exercises', grammarExerciseController.getExercises);

// Route: GET /api/grammar-exercises/:id (Lấy theo grammarId)
router.get('/grammar-exercises/:id', grammarExerciseController.getExercisesByGrammarId);

// Route cập nhật bài tập (Dành cho Admin)
router.put('/grammar-exercises/update/:id', authMiddleware, adminMiddleware, grammarExerciseController.updateExercise);

// Route xóa bài tập (Dành cho Admin)
router.delete('/grammar-exercises/delete/:id', authMiddleware, adminMiddleware, grammarExerciseController.deleteExercise);

module.exports = router;