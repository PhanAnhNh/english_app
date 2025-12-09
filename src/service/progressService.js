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
    // 1. Lấy thông tin Level của người dùng
    const user = await User.findById(userId).select('level');
    if (!user) {
        throw new Error('User not found');
    }
    const userLevel = user.level || 'A';
    const subLevelsForCurrentMajorLevel = LEVEL_MAP[userLevel] || [];

    // --- A. Tính toán Tiến trình theo Level (A, B, C) ---

    // Lấy tất cả các sub-level
    const allSubLevels = Object.values(LEVEL_MAP).flat();

    let totalProgressSteps = 0;
    let completedSteps = 0;

    // Giả định: Mỗi sub-level (A1, A2,...) là 1 bước tiến trình
    for (const subLevel of allSubLevels) {
        totalProgressSteps++; // Tổng số bước là 6 (A1 -> C2)

        // 1. Tính tổng số từ vựng trong Sub-level này
        const totalVocabsInSubLevel = await Vocabulary.countDocuments({ level: subLevel });

        if (totalVocabsInSubLevel === 0) continue; // Bỏ qua nếu không có từ vựng

        // 2. Đếm số từ người dùng đã học (status: 'memorized' hoặc 'learned')
        const learnedVocabsCount = await UserVocabulary.countDocuments({
            user: userId,
            status: { $in: ['memorized'] }, // Giả định 'memorized' là đã học
            // Tối ưu: Lọc theo Vocabulary.level = subLevel (cần Mongoose lookup, phức tạp hơn)
            // Thay vào đó, ta sẽ dùng cách đếm đơn giản hơn:
        });

        // **Cách 2 (Sử dụng Aggregation để đếm từ vựng đã học theo Level)**
        // Đây là cách chính xác hơn:
        const learnedInSubLevel = await UserVocabulary.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), status: 'memorized' } },
            {
                $lookup: {
                    from: 'vocabularies', // Tên collection Vocabulary
                    localField: 'vocabulary',
                    foreignField: '_id',
                    as: 'vocabData'
                }
            },
            { $unwind: '$vocabData' },
            { $match: { 'vocabData.level': subLevel } },
            { $count: 'count' }
        ]);

        const count = learnedInSubLevel.length > 0 ? learnedInSubLevel[0].count : 0;

        // Tiêu chí hoàn thành Sub-level (ví dụ: đạt 80% từ vựng)
        const completionThreshold = 0.8;
        if (count / totalVocabsInSubLevel >= completionThreshold) {
            completedSteps++;
        }
    }

    // Tính phần trăm Level tổng thể (trên 6 bước)
    const overallLevelPercentage = totalProgressSteps > 0
        ? (completedSteps / totalProgressSteps) * 100
        : 0;

    // --- B. Tính toán Tiến trình Thanh Level trên trang Chủ đề (Progress Bar) ---

    // Lấy danh sách các chủ đề trong Level hiện tại của User (ví dụ: Level 'A')
    const topicsInCurrentMajorLevel = await Topic.find({ level: userLevel }).select('_id');
    const totalTopicsInCurrentLevel = topicsInCurrentMajorLevel.length;
    const topicIdsInCurrentLevel = topicsInCurrentMajorLevel.map(t => t._id);

    // Tính số lượng chủ đề đã hoàn thành (Giả định: Hoàn thành 1 chủ đề = học hết tất cả từ vựng trong chủ đề đó)
    let completedTopicsCount = 0;

    for (const topicId of topicIdsInCurrentLevel) {
        // 1. Tính tổng số từ vựng trong Chủ đề
        const totalVocabsInTopic = await Vocabulary.countDocuments({ topic: topicId });

        if (totalVocabsInTopic === 0) {
            completedTopicsCount++; // Nếu chủ đề rỗng thì coi như hoàn thành
            continue;
        }

        // 2. Đếm số từ đã học (memorized) trong Chủ đề này
        const learnedInTopic = await UserVocabulary.aggregate([
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
            { $match: { 'vocabData.topic': topicId } },
            { $count: 'count' }
        ]);

        const count = learnedInTopic.length > 0 ? learnedInTopic[0].count : 0;

        // Tiêu chí hoàn thành Chủ đề (ví dụ: đạt 90% từ vựng)
        const topicCompletionThreshold = 0.9;
        if (count / totalVocabsInTopic >= topicCompletionThreshold) {
            completedTopicsCount++;
        }
    }

    // Tính phần trăm cho thanh Progress Bar trên trang Chủ đề
    const topicProgressBarPercentage = totalTopicsInCurrentLevel > 0
        ? (completedTopicsCount / totalTopicsInCurrentLevel) * 100
        : 0;

    return {
        overallLevel: userLevel,
        overallLevelPercentage: parseFloat(overallLevelPercentage.toFixed(2)),
        topicProgressBarPercentage: parseFloat(topicProgressBarPercentage.toFixed(2)),
        completedSteps: completedSteps, // Số sub-level đã hoàn thành
        totalSteps: totalProgressSteps, // Tổng sub-level (6)
        canLevelUp: topicProgressBarPercentage >= 100 // Lên Level A, B, C khi hoàn thành 100% chủ đề
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

