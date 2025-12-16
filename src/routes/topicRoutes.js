const express = require('express');
const router = express.Router();
const topicController = require('../controller/topicController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/topics', authMiddleware, topicController.getAllTopics);
router.get('/detail_topics/:id', authMiddleware, topicController.getTopicById);
router.post('/topics', authMiddleware, adminMiddleware, topicController.createTopic);
router.put('/edit_topic/:id', authMiddleware, adminMiddleware, topicController.updateTopic);
router.delete('/delet_topic/:id', authMiddleware, adminMiddleware, topicController.deleteTopic);

module.exports = router;

