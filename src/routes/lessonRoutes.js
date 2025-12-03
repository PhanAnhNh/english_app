const express = require('express');
const router = express.Router();
const lessonController = require('../controller/lessonController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/lessons/:topicId', authMiddleware, lessonController.getLessonsByTopic);
router.get('/detail_lesson/:id', authMiddleware, lessonController.getLessonById);
router.post('/lessons', authMiddleware, adminMiddleware, lessonController.createLesson);
router.put('/edit_lessons/:id', authMiddleware, adminMiddleware, lessonController.updateLesson);
router.delete('/delet_lessons/:id', authMiddleware, adminMiddleware, lessonController.deleteLesson);

module.exports = router;

