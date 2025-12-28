const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');

// Route Chatbot
router.post('/ai/chat', aiController.chatWithHamster);
router.get('/ai/config', aiController.getChatConfig);
router.put('/ai/config', aiController.updateChatConfig);

module.exports = router;
