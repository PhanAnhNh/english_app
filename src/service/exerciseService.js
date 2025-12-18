const Exercise = require('../model/Exercise');
const Topic = require('../model/Topic');

const getExercises = async (filters) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc', skill, level, type, topic, topicId, search } = filters;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    let filter = {};
    if (skill) filter.skill = skill;
    if (level) filter.level = level;
    if (type) filter.type = type;
    if (topic || topicId) filter.topicId = topic || topicId;

    if (search) {
        filter.$or = [
            { questionText: { $regex: search, $options: 'i' } },
            { explanation: { $regex: search, $options: 'i' } },
            { 'options.text': { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (pageNum - 1) * limitNum;
    const total = await Exercise.countDocuments(filter);
    const data = await Exercise.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }).populate('topicId', 'name');

    return { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), data };
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

