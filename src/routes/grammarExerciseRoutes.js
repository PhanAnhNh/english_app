const express = require('express');
const router = express.Router();
const grammarExerciseController = require('../controller/grammarExerciseController');

// Route: /api/grammar-exercises/:grammarId
// Ví dụ: GET /api/grammar-exercises/692e9bc3d46cf95644b236c1
router.get('/:grammarId', grammarExerciseController.getExercisesByGrammarId);

// Route thêm bài tập (nếu cần test)
router.post('/', grammarExerciseController.createExercise);

module.exports = router;