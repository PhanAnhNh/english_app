const Exercise = require('../model/Exercise');


const getExercises = async (filters) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc', skill, level, type, topic, search } = filters;

    let filter = {};
    if (skill) filter.skill = skill;
    if (level) filter.level = level;
    if (type) filter.type = type;
    if (topic) filter.topicRef = topic;

    if (search) {
        filter.$or = [
            { questionText: { $regex: search, $options: 'i' } },
            { explanation: { $regex: search, $options: 'i' } },
            { 'options.text': { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;
    const total = await Exercise.countDocuments(filter);
    const data = await Exercise.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });

    return { total, page, limit, totalPages: Math.ceil(total / limit), data };
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

