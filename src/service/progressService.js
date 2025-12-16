const Submission = require('../model/Submission');
const Progress = require('../model/Progress');
const Vocabulary = require('../model/Vocabulary');
const Exercise = require('../model/Exercise');
const Topic = require('../model/Topic');
const UserVocabulary = require('../model/UserVocabulary');
const User = require('../model/User');
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

// Bản đồ Level: User Level (A, B, C) -> Các sub-level (A1, A2...)
const LEVEL_MAP = {
    'A': ['A1', 'A2'],
    'B': ['B1', 'B2'],
    'C': ['C1', 'C2'],
};
const ORDERED_LEVELS = ['A', 'B', 'C'];
const MAX_LEVEL_INDEX = ORDERED_LEVELS.length - 1;

/**
 * 1. Tính tiến trình tổng quát (Level A, B, C)
 * 2. Tính tiến trình theo số chủ đề đã hoàn thành trong Level hiện tại
 */
const calculateUserProgress = async (userId) => {
    // 1. Lấy thông tin User
    const user = await User.findById(userId).select('level');
    if (!user) throw new Error('User not found');

    const currentLevel = user.level || 'A';
    const allSubLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    // --- BƯỚC 1: Tối ưu tính toán Overall Progress (Theo Sub-level) ---

    // Query 1: Lấy thống kê số lượng từ vựng hệ thống theo Level (Gom nhóm)
    const systemVocabStats = await Vocabulary.aggregate([
        { $group: { _id: "$level", count: { $sum: 1 } } }
    ]);
    // Chuyển về dạng Map để tra cứu nhanh: { 'A1': 150, 'A2': 200 ... }
    const systemVocabMap = systemVocabStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {});

    // Query 2: Lấy thống kê từ vựng user đã thuộc theo Level
    const userLearnedStats = await UserVocabulary.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), status: 'memorized' } },
        {
            $lookup: {
                from: 'vocabularies',
                localField: 'vocabulary',
                foreignField: '_id',
                as: 'vocabData'
            }
        },
        { $unwind: '$vocabData' },
        { $group: { _id: "$vocabData.level", count: { $sum: 1 } } }
    ]);

    const userLearnedMap = userLearnedStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {});

    // Tính toán Logic Overall (Xử lý bằng JS thuần, cực nhanh)
    let completedSteps = 0;
    const COMPLETION_THRESHOLD = 0.8; // 80%

    for (const subLevel of allSubLevels) {
        const total = systemVocabMap[subLevel] || 0;
        const learned = userLearnedMap[subLevel] || 0;

        if (total > 0 && (learned / total) >= COMPLETION_THRESHOLD) {
            completedSteps++;
        }
    }

    const overallLevelPercentage = (completedSteps / allSubLevels.length) * 100;


    // --- BƯỚC 2: Tối ưu tính toán Topic Progress (Thanh Level hiện tại) ---

    // Lấy danh sách Topic của Level hiện tại
    const topics = await Topic.find({ level: currentLevel }).select('_id');
    const topicIds = topics.map(t => t._id);
    const totalTopics = topicIds.length;

    if (totalTopics === 0) {
        return {
            overallLevel: currentLevel,
            overallLevelPercentage: parseFloat(overallLevelPercentage.toFixed(2)),
            topicProgressBarPercentage: 0, // Không có topic nào coi như xong
            canLevelUp: false,

            message: "Không tìm thấy Topic nào cho Level này"
        };
    }

    // Query 3: Đếm tổng từ vựng trong từng Topic (Của level hiện tại)
    const topicVocabCounts = await Vocabulary.aggregate([
        { $match: { topic: { $in: topicIds } } },
        { $group: { _id: "$topic", count: { $sum: 1 } } }
    ]);
    const topicTotalMap = topicVocabCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});

    // Query 4: Đếm từ vựng User đã thuộc trong từng Topic
    const topicLearnedCounts = await UserVocabulary.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), status: 'memorized' } },
        {
            $lookup: {
                from: 'vocabularies',
                localField: 'vocabulary',
                foreignField: '_id',
                as: 'vocabData'
            }
        },
        { $unwind: '$vocabData' },
        { $match: { "vocabData.topic": { $in: topicIds } } },
        { $group: { _id: "$vocabData.topic", count: { $sum: 1 } } }
    ]);

    const topicLearnedMap = topicLearnedCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});

    // Tính toán số topic hoàn thành
    let completedTopicsCount = 0;
    const TOPIC_THRESHOLD = 0.9; // 90%

    for (const topicId of topicIds) {
        const tid = topicId.toString();
        const total = topicTotalMap[tid] || 0;
        const learned = topicLearnedMap[tid] || 0;

        // Nếu topic không có từ vựng hoặc đã học > 90%
        if (total === 0 || (learned / total) >= TOPIC_THRESHOLD) {
            completedTopicsCount++;
        }
    }

    const topicProgressBarPercentage = (completedTopicsCount / totalTopics) * 100;

    return {
        overallLevel: currentLevel,
        overallLevelPercentage: parseFloat(overallLevelPercentage.toFixed(2)),
        topicProgressBarPercentage: parseFloat(topicProgressBarPercentage.toFixed(2)),
        completedSteps,
        totalSteps: allSubLevels.length,
        completedTopics: completedTopicsCount,
        totalTopics: totalTopics,
        canLevelUp: topicProgressBarPercentage >= 100
    };
};


/**
 * Chuyển Level (A -> B, B -> C)
 */
const levelUpUser = async (userId, currentLevel) => {
    const userIndex = ORDERED_LEVELS.indexOf(currentLevel);

    if (userIndex === MAX_LEVEL_INDEX) {
        return { message: "Bạn đã hoàn thành tất cả các Level." };
    }

    const nextLevel = ORDERED_LEVELS[userIndex + 1];

    // Cập nhật Level trong User Model
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { level: nextLevel },
        { new: true }
    );

    return {
        message: `Chúc mừng! Bạn đã lên Level ${nextLevel}!`,
        newLevel: nextLevel
    };
};

module.exports = {
    submitExercise,
    updateProgress,
    getLearningStats,
    getDetailedProgress,
    calculateUserProgress,
    levelUpUser
};

