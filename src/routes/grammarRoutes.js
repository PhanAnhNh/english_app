const express = require('express');
const router = express.Router();
const grammarController = require('../controller/grammarController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Grammar routes
router.get('/grammar', authMiddleware, grammarController.getGrammars);
router.get('/detail_grammar/:id', authMiddleware, grammarController.getGrammarById);
router.post('/add_grammar', authMiddleware, adminMiddleware, grammarController.createGrammar);
router.put('/edit_grammar/:id', authMiddleware, adminMiddleware, grammarController.updateGrammar);
router.delete('/delet_grammar/:id', authMiddleware, adminMiddleware, grammarController.deleteGrammar);
router.get('/grammar/by-category/:categoryId', authMiddleware, grammarController.getGrammarsByCategory);

// Grammar category routes
router.get('/grammar-categories', authMiddleware, grammarController.getGrammarCategories);
router.get('/grammar-categories-with-count', authMiddleware, grammarController.getGrammarCategoriesWithCount);
router.get('/grammar-category/:id', authMiddleware, grammarController.getGrammarCategoryById);
router.get('/grammar-categories/:id', authMiddleware, grammarController.getGrammarCategoryDetail);
router.post('/grammar-categories', authMiddleware, adminMiddleware, grammarController.createGrammarCategory);
router.put('/grammar-categories/:id', authMiddleware, adminMiddleware, grammarController.updateGrammarCategory);
router.delete('/grammar-categories/:id', authMiddleware, adminMiddleware, grammarController.deleteGrammarCategory);

module.exports = router;

