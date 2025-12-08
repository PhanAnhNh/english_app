const grammarService = require('../service/grammarService');

const getGrammars = async (req, res) => {
    try {
        const result = await grammarService.getGrammars(req.query);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getGrammarById = async (req, res) => {
    try {
        const item = await grammarService.getGrammarById(req.params.id);
        res.json(item);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

const createGrammar = async (req, res) => {
    try {
        const item = await grammarService.createGrammar(req.body);
        res.json(item);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateGrammar = async (req, res) => {
    try {
        const updated = await grammarService.updateGrammar(req.params.id, req.body);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const deleteGrammar = async (req, res) => {
    try {
        const result = await grammarService.deleteGrammar(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getGrammarCategories = async (req, res) => {
    try {
        const categories = await grammarService.getGrammarCategories();
        res.json(categories);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getGrammarCategoriesWithCount = async (req, res) => {
    try {
        const result = await grammarService.getGrammarCategoriesWithCount(req.query.level);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getGrammarCategoryById = async (req, res) => {
    try {
        const result = await grammarService.getGrammarCategoryById(req.params.id, req.query);
        res.json(result);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

const getGrammarCategoryDetail = async (req, res) => {
    try {
        const category = await grammarService.getGrammarCategoryDetail(req.params.id);
        res.json(category);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

const createGrammarCategory = async (req, res) => {
    try {
        const category = await grammarService.createGrammarCategory(req.body);
        res.json(category);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateGrammarCategory = async (req, res) => {
    try {
        const updated = await grammarService.updateGrammarCategory(req.params.id, req.body);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const deleteGrammarCategory = async (req, res) => {
    try {
        const result = await grammarService.deleteGrammarCategory(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getGrammarsByCategory = async (req, res) => {
    try {
        const result = await grammarService.getGrammarsByCategory(req.params.categoryId, req.query);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getGrammars,
    getGrammarById,
    createGrammar,
    updateGrammar,
    deleteGrammar,
    getGrammarCategories,
    getGrammarCategoriesWithCount,
    getGrammarCategoryById,
    getGrammarCategoryDetail,
    createGrammarCategory,
    updateGrammarCategory,
    deleteGrammarCategory,
    getGrammarsByCategory
};
