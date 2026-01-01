const Exercise = require('../model/Exercise');

/**
 * GET /exercises
 * Lấy danh sách câu hỏi / bài tập
 * Query: level, mode, skill, page, limit
 */
const getExercises = async (req, res) => {
    try {
        const {
            level,
            mode,
            skill,
            topicId,
            page = 1,
            limit = 10
        } = req.query;

        const query = { isActive: true };

        if (level) query.level = level;
        if (mode) query.mode = mode;
        if (skill) query.skill = skill;
        if (topicId) query.topicId = topicId;

        const exercises = await Exercise.find(query)
            .limit(Number(limit))
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Exercise.countDocuments(query);

        res.json({
            exercises,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalExercises: count
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

/**
 * GET /exercises/:id
 */
const getExerciseById = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
        }
        res.json(exercise);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

/**
 * POST /exercises
 * (Admin)
 */
const createExercise = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const newExercise = new Exercise({
            ...req.body,
            createdBy: req.user.id
        });

        await newExercise.save();
        res.status(201).json(newExercise);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

/**
 * PUT /exercises/:id
 * (Admin)
 */
const updateExercise = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const updated = await Exercise.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
        }

        res.json(updated);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

/**
 * DELETE /exercises/:id
 * (Admin)
 */
const deleteExercise = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await Exercise.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thành công' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise
};
