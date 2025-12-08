const GrammarExercise = require('../model/GrammarExercise');

// Lấy danh sách bài tập (có thể filter theo grammarId)
exports.getExercises = async (req, res) => {
    try {
        const { grammarId } = req.query;
        const filter = { isActive: true };

        if (grammarId) {
            filter.grammarId = grammarId;
        }

        const exercises = await GrammarExercise.find(filter);

        res.status(200).json({
            success: true,
            count: exercises.length,
            data: exercises
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

// Lấy danh sách bài tập theo grammarId
exports.getExercisesByGrammarId = async (req, res) => {
    try {
        const { id } = req.params;
        const exercises = await GrammarExercise.find({ grammarId: id, isActive: true });

        res.status(200).json({
            success: true,
            count: exercises.length,
            data: exercises
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

// Tạo bài tập mới (Dành cho Admin)
exports.createExercise = async (req, res) => {
    try {
        const newExercise = new GrammarExercise(req.body);
        const savedExercise = await newExercise.save();
        res.status(201).json({ success: true, data: savedExercise });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo bài tập", error: error.message });
    }
};

// Cập nhật bài tập (Dành cho Admin)
exports.updateExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedExercise = await GrammarExercise.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedExercise) {
            return res.status(404).json({ message: "Không tìm thấy bài tập." });
        }

        res.status(200).json({ success: true, data: updatedExercise });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật bài tập", error: error.message });
    }
};

// Xóa bài tập (Dành cho Admin)
exports.deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const exercise = await GrammarExercise.findById(id);

        if (!exercise) {
            return res.status(404).json({ message: "Không tìm thấy bài tập." });
        }

        await GrammarExercise.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Đã xóa bài tập thành công." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa bài tập", error: error.message });
    }
};