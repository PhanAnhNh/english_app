const Lesson = require('../model/Lesson');

const getLessonsByTopic = async (topicId) => {
    const data = await Lesson.find({ topicId })
        .sort({ order: 1 })
        .populate('exercises');

    return {
        total: data.length,
        page: 1,
        limit: data.length,
        data
    };
};

const getLessonById = async (lessonId) => {
    const item = await Lesson.findById(lessonId).populate('exercises');
    if (!item) {
        throw new Error('Không tìm thấy bài học');
    }
    return item;
};

const createLesson = async (lessonData) => {
    const lesson = new Lesson(lessonData);
    await lesson.save();
    return lesson;
};

const updateLesson = async (lessonId, lessonData) => {
    const updated = await Lesson.findByIdAndUpdate(lessonId, lessonData, { new: true });
    return updated;
};

const deleteLesson = async (lessonId) => {
    await Lesson.findByIdAndDelete(lessonId);
    return { message: 'Đã xóa thành công' };
};

module.exports = {
    getLessonsByTopic,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
};

