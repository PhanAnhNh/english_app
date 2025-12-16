const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Admin routes
router.post('/admin/add_users', authMiddleware, adminMiddleware, userController.addUser);
router.get('/admin/users', authMiddleware, adminMiddleware, userController.getUsers);
router.get('/admin/users/:id', authMiddleware, adminMiddleware, userController.getUserById);
router.put('/admin/users/:id', authMiddleware, adminMiddleware, userController.updateUser);
router.put('/admin/users/:id/reset-password', authMiddleware, adminMiddleware, userController.resetPassword);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, userController.deleteUser);
router.get('/admin/users-stats', authMiddleware, adminMiddleware, userController.getUsersStats);
router.get('/admin/stats/new-users', authMiddleware, adminMiddleware, userController.getNewUsersStats);

// User routes
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;
