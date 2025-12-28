const express = require('express');
const router = express.Router();
const landingPageController = require('../controller/landingPageController');
const adminAuth = require('../middleware/admin');

// Public routes - no authentication required
router.get('/content', landingPageController.getLandingPageContent);
router.get('/statistics', landingPageController.getRealTimeStatistics);
router.get('/theme', landingPageController.getThemeSettings);

const authMiddleware = require('../middleware/auth');

// Admin routes - authentication required
router.put('/content/:section', authMiddleware, adminAuth, landingPageController.updateLandingPageContent);
router.put('/theme', authMiddleware, adminAuth, landingPageController.updateThemeSettings);

module.exports = router;
