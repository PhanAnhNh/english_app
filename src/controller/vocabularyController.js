const vocabularyService = require('../service/vocabularyService');

const getVocabularies = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        const result = await vocabularyService.getVocabularies(req.query, userId);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getVocabularyById = async (req, res) => {
    try {
        // Lấy userId từ token (nếu người dùng đã đăng nhập)
        const userId = req.user ? req.user.id : null;

        // Truyền userId vào service
        const item = await vocabularyService.getVocabularyById(req.params.id, userId);

        res.json(item);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

const createVocabulary = async (req, res) => {
    try {
        const item = await vocabularyService.createVocabulary(req.body, req.user.id, req.files);
        res.json(item);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateVocabulary = async (req, res) => {
    try {
        const updated = await vocabularyService.updateVocabulary(req.params.id, req.body, req.files);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const deleteVocabulary = async (req, res) => {
    try {
        const result = await vocabularyService.deleteVocabulary(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getVocabularyTypes = async (req, res) => {
    try {
        const types = await vocabularyService.getDistinctTypes();
        res.json({ types });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getVocabularies,
    getVocabularyById,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary,
    getVocabularyTypes
};
