const express = require('express');
const router = express.Router();
const grammarExerciseController = require('../controller/grammarExerciseController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

//Tạo mới một grammerExercise

router.post('/create', authMiddleware, adminMiddleware, grammarExerciseController.createExercise);

//Lấy tất cả các grammerExercise

router.get('/', grammarExerciseController.getExercises);

//Lấy các grammerExercise theo grammarId

router.get('/:id', grammarExerciseController.getExercisesByGrammarId);

//Cập nhật một grammerExercise
router.put('/update/:id', authMiddleware, adminMiddleware, grammarExerciseController.updateExercise);

//Xóa một grammerExercise
router.delete('/delete/:id', authMiddleware, adminMiddleware, grammarExerciseController.deleteExercise);


module.exports = router;