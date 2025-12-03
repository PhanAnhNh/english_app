const express = require('express');
const router = express.Router();
const exerciseController = require('../controller/exerciseController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/exercises', authMiddleware, exerciseController.getExercises);
router.get('/detail_exercises/:id', authMiddleware, exerciseController.getExerciseById);
router.post('/exercises', authMiddleware, adminMiddleware, exerciseController.createExercise);
router.put('/edit_exercise/:id', authMiddleware, adminMiddleware, exerciseController.updateExercise);
router.delete('/delet_exercise/:id', authMiddleware, adminMiddleware, exerciseController.deleteExercise);

module.exports = router;

