const Question = require('../model/Question');

// Lấy danh sách câu hỏi (có lọc theo level, mode)
const getQuestions = async (req, res) => {
    try {
        const { level, mode, page = 1, limit = 10 } = req.query;

        const query = { isActive: true }; // Chỉ lấy câu đang hoạt động
        if (level) query.level = level;
        if (mode) query.mode = mode;

        const questions = await Question.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 }); // Mới nhất lên đầu

        const count = await Question.countDocuments(query);

        res.json({
            questions,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalQuestions: count
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Thêm câu hỏi mới (Chỉ Admin)
const createQuestion = async (req, res) => {
    try {
        // Kiểm tra role admin (Logic này nên tách ra middleware riêng)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const newQuestion = new Question({
            ...req.body,
            createdBy: req.user.id
        });
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

// Sửa câu hỏi (Chỉ Admin)
const updateQuestion = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Trả về data mới sau khi update
        );
        if (!updatedQuestion) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
        res.json(updatedQuestion);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

// Xóa câu hỏi (Chỉ Admin)
const deleteQuestion = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thành công' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = { getQuestions, createQuestion, updateQuestion, deleteQuestion };