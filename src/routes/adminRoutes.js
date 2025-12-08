const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/admin/logs', authMiddleware, adminMiddleware, adminController.getAdminLogs);

module.exports = router;

