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


const ORDERED_LEVELS = ['A', 'B', 'C'];
const MAX_LEVEL_INDEX = ORDERED_LEVELS.length - 1;


const calculateUserProgress = async (userId) => {
    // 1. Lấy tất cả Topic
    const allTopics = await Topic.find({}).select('_id');
    const totalTopics = allTopics.length;

    // Nếu không có topic nào
    if (totalTopics === 0) {
        return {
            displayTitle: "Tiến độ học tập",
            percent: 0,
            completedTopics: 0,
            totalTopics: 0
        };
    }

    const allTopicIds = allTopics.map(t => t._id);

    // 2. Đếm TỔNG số từ vựng trong các topic này (Total Vocabulary)
    const totalVocabCountResult = await Vocabulary.aggregate([
        { $match: { topic: { $in: allTopicIds } } },
        { $count: "total" }
    ]);
    const totalSystemVocab = totalVocabCountResult.length > 0 ? totalVocabCountResult[0].total : 0;

    // 3. Đếm TỔNG số từ user đã thuộc (Memorized Vocabulary)
    // Lưu ý: Cần filter theo topic để đảm bảo từ đó thuộc các topic đang xét (tránh tính các từ mồ côi)
    const learnedVocabCountResult = await UserVocabulary.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                status: 'memorized'
            }
        },
        {
            $lookup: {
                from: 'vocabularies',
                localField: 'vocabulary',
                foreignField: '_id',
                as: 'vocabData'
            }
        },
        { $unwind: '$vocabData' },
        { $match: { "vocabData.topic": { $in: allTopicIds } } },
        { $count: "learned" }
    ]);
    const totalLearnedVocab = learnedVocabCountResult.length > 0 ? learnedVocabCountResult[0].learned : 0;

    // --- Logic tính Completed Topic (Giữ lại để hiển thị số topic đã xong nếu cần) ---
    // (Bạn có thể giữ nguyên logic cũ phần này để đếm số topic, nhưng KHÔNG dùng nó để tính %)
    const topicVocabCounts = await Vocabulary.aggregate([
        { $match: { topic: { $in: allTopicIds } } },
        { $group: { _id: "$topic", count: { $sum: 1 } } }
    ]);
    const topicTotalMap = topicVocabCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});

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
        { $match: { "vocabData.topic": { $in: allTopicIds } } },
        { $group: { _id: "$vocabData.topic", count: { $sum: 1 } } }
    ]);
    const topicLearnedMap = topicLearnedCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});

    let completedTopicsCount = 0;
    const TOPIC_COMPLETION_THRESHOLD = 0.9;

    for (const topicId of allTopicIds) {
        const tid = topicId.toString();
        const tVocab = topicTotalMap[tid] || 0;
        const lVocab = topicLearnedMap[tid] || 0;
        if (tVocab > 0 && (lVocab / tVocab) >= TOPIC_COMPLETION_THRESHOLD) {
            completedTopicsCount++;
        }
    }

    // 4. TÍNH PHẦN TRĂM MỚI (Dựa trên từ vựng)
    // Nếu tổng từ vựng = 0 thì phần trăm là 0 để tránh chia cho 0
    let overallPercentage = 0;
    if (totalSystemVocab > 0) {
        overallPercentage = (totalLearnedVocab / totalSystemVocab) * 100;
    }

    return {
        displayTitle: "Tiến độ học tập",
        percent: parseFloat(overallPercentage.toFixed(2)), // VD: 12.5%
        completedTopics: completedTopicsCount, // Vẫn trả về số topic đã xong để UI dùng nếu cần
        totalTopics: totalTopics,
        totalLearnedVocab: totalLearnedVocab, // Trả thêm info này cho FE hiển thị (VD: Đã thuộc 50/200 từ)
        totalSystemVocab: totalSystemVocab,
        overallLevel: "All",
        canLevelUp: false
    };
};

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

