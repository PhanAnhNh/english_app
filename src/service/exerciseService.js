const Exercise = require('../model/Exercise');
const Topic = require('../model/Topic');
const mongoose = require('mongoose');

const getExercises = async (filters) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc', skill, level, type, topic, topicId, search, random } = filters;

    let filter = {};
    if (skill) filter.skill = skill;
    if (level) filter.level = level;
    if (type) filter.type = type;
    // Xử lý lọc topicId (bao gồm cả trường hợp topicId=null)
    const tId = topicId || topic;
    if (tId === 'null') {
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

    // Nếu có tham số random=true, sử dụng $sample để lấy ngẫu nhiên cực nhanh
    if (random === 'true' || random === true) {
        const limitNum = parseInt(limit) || 10;

        // aggregate cần ObjectId thực sự, không tự ép kiểu từ string như find()
        const matchFilter = { ...filter };
        if (matchFilter.topicId && typeof matchFilter.topicId === 'string' && mongoose.Types.ObjectId.isValid(matchFilter.topicId)) {
            matchFilter.topicId = new mongoose.Types.ObjectId(matchFilter.topicId);
        }

        const data = await Exercise.aggregate([
            { $match: matchFilter },
            { $sample: { size: limitNum } }
        ]);

        // Populate topicId cho trang Admin/App hiển thị tên chủ đề
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
    let query = Exercise.find(filter).sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 }).populate('topicId', 'name');

    if (limit && !isNaN(parseInt(limit))) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        query = query.skip(skip).limit(limitNum);
    }

    const data = await query;

    return {
        total,
        page: parseInt(page) || 1,
        limit: limit ? parseInt(limit) : total,
        totalPages: limit ? Math.ceil(total / parseInt(limit)) : 1,
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

