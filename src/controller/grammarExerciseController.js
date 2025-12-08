const GrammarExercise = require('../model/GrammarExercise');

// Lấy danh sách bài tập theo Grammar ID (Ví dụ: Lấy tất cả bài tập của thì Hiện tại đơn)
exports.getExercisesByGrammarId = async (req, res) => {
    try {
        const { grammarId } = req.params;

        const exercises = await GrammarExercise.find({
            grammarId: grammarId,
            isActive: true
        });

        if (!exercises) {
            return res.status(404).json({ message: "Không tìm thấy bài tập nào." });
        }

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