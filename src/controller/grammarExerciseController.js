const GrammarExercise = require('../model/GrammarExercise');
const Grammar = require('../model/Grammar');
const mongoose = require('mongoose');

exports.getExercises = async (req, res) => {
    try {
        const { grammarId, grammarCategoryId, random, limit, page, search } = req.query;
        const filter = { isActive: true };

        if (grammarId) {
            filter.grammarId = new mongoose.Types.ObjectId(grammarId);
        } else if (grammarCategoryId) {
            // Find all grammars in this category
            const grammars = await Grammar.find({ categoryId: grammarCategoryId }).select('_id');
            const grammarIds = grammars.map(g => g._id);
            filter.grammarId = { $in: grammarIds };
        }

        // Add search functionality (question or explanation)
        if (search) {
            filter.$or = [
                { question: { $regex: search, $options: 'i' } },
                { explanation: { $regex: search, $options: 'i' } }
            ];
        }

        const limitVal = parseInt(limit) || 10;
        const pageNum = parseInt(page) || 1;

        if (random === 'true') {
            const exercises = await GrammarExercise.aggregate([
                { $match: filter },
                { $sample: { size: limitVal } }
            ]);

            // Populate manually after aggregate
            const populatedExercises = await GrammarExercise.populate(exercises, { path: 'grammarId', select: 'title level' });

            return res.status(200).json({
                success: true,
                count: populatedExercises.length,
                data: populatedExercises,
                total: populatedExercises.length,
                page: 1,
                limit: limitVal,
                totalPages: 1
            });
        }

        // Count total for pagination
        const total = await GrammarExercise.countDocuments(filter);
        const totalPages = Math.ceil(total / limitVal);
        const skip = (pageNum - 1) * limitVal;

        const exercises = await GrammarExercise.find(filter)
            .populate('grammarId', 'title level')
            .sort({ createdAt: -1 }) // Sort by new
            .skip(skip)
            .limit(limitVal);

        res.status(200).json({
            success: true,
            count: exercises.length,
            total: total,
            page: pageNum,
            limit: limitVal,
            totalPages: totalPages,
            data: exercises
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};


// Lấy danh sách bài tập theo Grammar ID (Ví dụ: Lấy tất cả bài tập của thì Hiện tại đơn)
exports.getExercisesByGrammarId = async (req, res) => {
    try {
        const { grammarId } = req.params;

        const exercises = await GrammarExercise.find({
            grammarId: grammarId,
            isActive: true
        }).populate('grammarId', 'title level');

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
