const Submission = require('../model/Submission');
const Progress = require('../model/Progress');
const Vocabulary = require('../model/Vocabulary');
const Exercise = require('../model/Exercise');
const Topic = require('../model/Topic');
const mongoose = require('mongoose');

const submitExercise = async (submissionData, userId) => {
    submissionData.userId = submissionData.userId || userId;
    const submission = new Submission(submissionData);
    await submission.save();
    return { message: 'Nộp bài thành công', id: submission._id };
};

const updateProgress = async (progressData, userId) => {
    const { topicId, lessonId, score } = progressData;
    const uid = userId;

    let progress = await Progress.findOne({ userId: uid, lessonId });
    if (!progress) {
        progress = new Progress({ userId: uid, topicId, lessonId, completed: true, score });
    } else {
        progress.score = score;
        progress.completed = true;
        progress.lastUpdated = new Date();
    }
    await progress.save();
    return progress;
};

const getLearningStats = async (userId) => {
    // Thống kê tổng quan
    const totalVocab = await Vocabulary.countDocuments();
    const learnedVocab = await Progress.countDocuments({
        userId, completed: true
    });

    const totalExercises = await Exercise.countDocuments();
    const completedExercises = await Submission.countDocuments({ userId });

    // Tiến độ theo level
    const levelProgress = await Progress.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $lookup: { from: 'topics', localField: 'topicId', foreignField: '_id', as: 'topic' } },
        {
            $group: {
                _id: '$topic.level',
                completed: { $sum: { $cond: ['$completed', 1, 0] } },
                total: { $sum: 1 }
            }
        }
    ]);

    // Điểm số trung bình
    const averageScore = await Submission.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);

    return {
        learnedVocab,
        totalVocab,
        completedExercises,
        totalExercises,
        levelProgress,
        averageScore: averageScore[0]?.avgScore || 0,
        completionRate: Math.round((learnedVocab / totalVocab) * 100) || 0
    };
};

const getDetailedProgress = async (userId, days = 30) => {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Thống kê học tập theo ngày
    const dailyProgress = await Submission.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                submittedAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$submittedAt' },
                    month: { $month: '$submittedAt' },
                    day: { $dayOfMonth: '$submittedAt' }
                },
                exercisesCompleted: { $sum: 1 },
                averageScore: { $avg: '$score' },
                totalXP: { $sum: '$score' }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);

    return { dailyProgress };
};

module.exports = {
    submitExercise,
    updateProgress,
    getLearningStats,
    getDetailedProgress
};

