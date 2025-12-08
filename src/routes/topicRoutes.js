const express = require('express');
const router = express.Router();
const topicController = require('../controller/topicController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload.middleware');

router.get('/topics', authMiddleware, topicController.getTopics);
router.get('/detail_topics/:id', authMiddleware, topicController.getTopicById);
router.post('/topics', authMiddleware, adminMiddleware, upload.single('image'), topicController.createTopic);
router.put('/edit_topic/:id', authMiddleware, adminMiddleware, upload.single('image'), topicController.updateTopic);
router.delete('/delet_topic/:id', authMiddleware, adminMiddleware, topicController.deleteTopic);

module.exports = router;

