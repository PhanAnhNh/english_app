const express = require('express');
const router = express.Router();
const exerciseController = require('../controller/exerciseController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload.middleware');

router.get('/exercises', authMiddleware, exerciseController.getExercises);
router.get('/detail_exercises/:id', authMiddleware, exerciseController.getExerciseById);
router.post('/exercises', authMiddleware, adminMiddleware, upload.single('audio'), exerciseController.createExercise);
router.put('/edit_exercise/:id', authMiddleware, adminMiddleware, upload.single('audio'), exerciseController.updateExercise);
router.delete('/delet_exercise/:id', authMiddleware, adminMiddleware, exerciseController.deleteExercise);

module.exports = router;

