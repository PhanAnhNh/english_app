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

    // ✅ BẮT BUỘC: chỉ lấy câu hỏi đang active
    let filter = { isActive: true };

    if (skill) filter.skill = skill;
    if (level) filter.level = level;
    if (type) filter.type = type;
    if (mode) filter.mode = mode;

    const tId = topicId || topic;
    if (tId === 'null' || tId === null) {
        filter.topicId = null;
    } else if (tId) {
        filter.topicId = tId;
    }

    if (search) {
        filter.$or = [
            { questionText: { $regex: search, $options: 'i' } },
            { explanation: { $regex: search, $options: 'i' } },
            { 'options.text': { $regex: search, $options: 'i' } }
        ];
    }

    // 🎯 RANDOM (PVP cực chuẩn)
    if (random === 'true' || random === true) {
        const limitNum = parseInt(limit) || 10;

        const matchFilter = { ...filter };
        if (
            matchFilter.topicId &&
            typeof matchFilter.topicId === 'string' &&
            mongoose.Types.ObjectId.isValid(matchFilter.topicId)
        ) {
            matchFilter.topicId = new mongoose.Types.ObjectId(matchFilter.topicId);
        }

        const data = await Exercise.aggregate([
            { $match: matchFilter },
            { $sample: { size: limitNum } }
        ]);

        await Exercise.populate(data, { path: 'topicId', select: 'name' });

        return {
            total: data.length,
            page: 1,
            limit: limitNum,
            totalPages: 1,
            data
        };
    }

    const total = await Exercise.countDocuments(filter);

    const sortDirection = sortOrder === 'desc' || sortOrder === -1 ? -1 : 1;

    let query = Exercise.find(filter)
        .sort({ [sortBy]: sortDirection })
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
    if (!item) {
        throw new Error('Không tìm thấy bài tập');
    }
    return item;
};

const createExercise = async (exerciseData) => {
    const item = new Exercise(exerciseData);
    await item.save();
    return item;
};

const updateExercise = async (exerciseId, exerciseData) => {
    const updated = await Exercise.findByIdAndUpdate(exerciseId, exerciseData, { new: true });
    return updated;
};

const deleteExercise = async (exerciseId) => {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
        throw new Error('Không tìm thấy bài tập');
    }

    // Xóa audio trên Cloudinary


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

