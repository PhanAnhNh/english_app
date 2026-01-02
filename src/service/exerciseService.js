// service/exerciseService.js
const Exercise = require('../model/Exercise');
const Topic = require('../model/Topic');
const mongoose = require('mongoose');

const getExercises = async (filters) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'asc',
        skill,
        level,
        type,
        topic,
        topicId,
        search,
        random,
        mode
    } = filters;

    // 1. Xử lý isActive: Lấy bài active HOẶC bài cũ chưa có trường isActive
    let filter = {
        $or: [
            { isActive: true },
        ]
    };

    // 2. Các bộ lọc cơ bản
    if (skill) filter.skill = skill;
    if (level) filter.level = level;
    if (type) filter.type = type;

    // Nếu app gửi mode lên (vd: practice), thì lọc. Nếu không gửi thì lấy tất cả.
    if (mode) filter.mode = mode;

    // 3. Xử lý TopicId
    const tId = topicId || topic;
    if (tId === 'null' || tId === null) {
        filter.topicId = null;
    } else if (tId && mongoose.Types.ObjectId.isValid(tId)) {
        // Chỉ lọc topicId nếu tId hợp lệ
        filter.topicId = tId;
    }

    // 4. Tìm kiếm (Search)
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        filter.$and = [
            {
                $or: [
                    { questionText: searchRegex },
                    { explanation: searchRegex },
                    { 'options.text': searchRegex }
                ]
            }
        ];
    }

    // --- LOGIC LẤY NGẪU NHIÊN (Cho Practice/Quiz) ---
    if (random === 'true' || random === true) {
        const limitNum = parseInt(limit) || 10;

        // Chuẩn bị filter cho Aggregate (cần ObjectId chuẩn)
        const matchFilter = { ...filter };
        if (matchFilter.topicId && typeof matchFilter.topicId === 'string') {
            matchFilter.topicId = new mongoose.Types.ObjectId(matchFilter.topicId);
        }

        // Bỏ các toán tử $regex phức tạp ra khỏi aggregate nếu không cần thiết để tránh lỗi
        // Hoặc giữ nguyên nếu MongoDB version hỗ trợ tốt.

        const data = await Exercise.aggregate([
            { $match: matchFilter },
            { $sample: { size: limitNum } } // Lấy ngẫu nhiên
        ]);

        // Populate lại topic info
        await Exercise.populate(data, { path: 'topicId', select: 'name' });

        return {
            total: data.length,
            page: 1,
            limit: limitNum,
            totalPages: 1,
            data
        };
    }

    // --- LOGIC LẤY DANH SÁCH THƯỜNG (Admin/List) ---
    const total = await Exercise.countDocuments(filter);

    let query = Exercise.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .populate('topicId', 'name');

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit);

    if (!isNaN(limitNum)) {
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const data = await query;

    return {
        total,
        page: pageNum,
        limit: limitNum || total,
        totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
        data
    };
};

const getExerciseById = async (exerciseId) => {
    const item = await Exercise.findById(exerciseId);
    if (!item) throw new Error('Không tìm thấy bài tập');
    return item;
};

const createExercise = async (exerciseData, userId) => {
    const item = new Exercise({
        ...exerciseData,
        createdBy: userId // Lưu người tạo nếu có
    });
    await item.save();
    return item;
};

const updateExercise = async (exerciseId, exerciseData) => {
    const updated = await Exercise.findByIdAndUpdate(exerciseId, exerciseData, { new: true });
    if (!updated) throw new Error('Không tìm thấy bài tập để sửa');
    return updated;
};

const deleteExercise = async (exerciseId) => {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) throw new Error('Không tìm thấy bài tập');
    await Exercise.findByIdAndDelete(exerciseId);
    return { message: 'Đã xóa thành công' };
};

module.exports = {
    getExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise
};