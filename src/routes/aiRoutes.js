const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');

// Route Chatbot
router.post('/chat', aiController.chatWithHamster);
router.get('/config', aiController.getChatConfig);
router.put('/config', aiController.updateChatConfig);

module.exports = router;
