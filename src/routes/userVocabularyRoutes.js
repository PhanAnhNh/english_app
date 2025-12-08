const express = require('express');
const router = express.Router();
const userVocabularyController = require('../controller/userVocabularyController');

// Giả sử bạn có middleware check login tên là verifyToken
// Nếu tên file middleware của bạn khác, hãy sửa lại đường dẫn
const verifyToken = require('../middleware/auth');

// Định nghĩa API: POST /api/user-vocabulary/add
router.post('/add', verifyToken, userVocabularyController.addToDictionary);

module.exports = router;