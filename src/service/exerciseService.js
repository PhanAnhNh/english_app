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

        // Xử lý lại $or trong aggregate nếu cần thiết, nhưng đơn giản nhất là xóa $or phức tạp nếu không cần
        // Lưu ý: aggregate match với isActive cần cẩn thận.
        // Ta dùng logic đơn giản cho matchFilter topicId:
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

// --- UNIFIED PAGINATION (Regular + Grammar) ---
const getUnifiedExercises = async (filters) => {
    const {
        page = 1,
        limit = 10,
        sortOrder = 'desc', // Default desc for admin
        skill,
        level,
        type,
        topicId,
        search,
        grammarCategoryId,
        mode,
        grammarId
    } = filters;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    // --- PIPELINE 1: REGULAR EXERCISES ---
    const regularMatch = { isActive: true };
    if (skill) regularMatch.skill = skill;
    if (level) regularMatch.level = level;
    if (type) regularMatch.type = type;
    if (mode) regularMatch.mode = mode;
    if (topicId) regularMatch.topicId = new mongoose.Types.ObjectId(topicId);
    if (grammarId) regularMatch.grammarId = new mongoose.Types.ObjectId(grammarId);

    // Search Regular
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        regularMatch.$or = [
            { questionText: searchRegex },
            { explanation: searchRegex },
            { 'options.text': searchRegex }
        ];
    }

    // REMOVED BLOCKING OF GRAMMAR SKILL FOR REGULAR EXERCISES
    // Because we now have generic exercises with skill='grammar' (e.g. PVP)

    // --- PIPELINE 2: GRAMMAR EXERCISES (Union) ---
    // Note: GrammarExercise schema needs Lookup to get Level from 'grammars' collection.

    const grammarPipeline = [];

    // 1. Initial Match (Active & Search)
    const grammarMatchEarly = { isActive: true };
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        grammarMatchEarly.$or = [
            { question: searchRegex },
            { explanation: searchRegex }
        ];
    }
    // Filter by grammarId early if possible (optimized)
    if (grammarId) {
        grammarMatchEarly.grammarId = new mongoose.Types.ObjectId(grammarId);
    }

    grammarPipeline.push({ $match: grammarMatchEarly });

    // 2. Lookup Grammar Info (for Level & Title)
    grammarPipeline.push({
        $lookup: {
            from: 'grammars',
            localField: 'grammarId',
            foreignField: '_id',
            as: 'grammarInfo'
        }
    });
    grammarPipeline.push({ $unwind: { path: '$grammarInfo', preserveNullAndEmptyArrays: true } });

    // 3. Normalize Fields to match Regular Structure
    grammarPipeline.push({
        $addFields: {
            skill: 'grammar',
            level: '$grammarInfo.level',
            grammarTitle: '$grammarInfo.title',
            grammarCategoryId: '$grammarInfo.categoryId',
            // Mimic populate: Replace grammarId (ObjectId) with the populated object
            grammarId: '$grammarInfo',
            // Computed Type
            typeValue: {
                $cond: { if: { $gt: [{ $size: "$options" }, 0] }, then: 'multiple_choice', else: 'fill_in_blank' }
            },
            type: {
                $cond: { if: { $gt: [{ $size: "$options" }, 0] }, then: 'Trắc nghiệm', else: 'Điền từ' }
            },
            questionText: '$question', // Map question to questionText
            _source: 'grammar',
            mode: 'practice' // Grammar exercises are always practice mode
        }
    });

    // 4. Filter Grammar (Level, Type, Category)
    const grammarMatchLate = {};
    if (level) grammarMatchLate.level = level;
    if (type) grammarMatchLate.typeValue = type; // Frontend sends 'multiple_choice', we mapped it to typeValue
    if (grammarCategoryId) grammarMatchLate.grammarCategoryId = new mongoose.Types.ObjectId(grammarCategoryId);

    // If filtering by mode, only include grammar exercises if mode is 'practice'
    if (mode && mode !== 'practice') {
        // Grammar exercises are practice only. If user wants PVP, block them.
        grammarMatchLate.mode = mode; // This will fail match because mode is 'practice'
    }

    // If skill filter is present and NOT grammar, block grammar results
    if (skill && skill !== 'grammar') {
        grammarMatchLate.skill = 'block_me'; // Impossible value
    }

    // Apply late match if any conditions exist
    if (Object.keys(grammarMatchLate).length > 0) {
        grammarPipeline.push({ $match: grammarMatchLate });
    }

    // --- MAIN AGGREGATION ---
    const pipeline = [
        // A. Start with Regular Exercises
        { $match: regularMatch },
        {
            $addFields: {
                _source: 'regular',
                typeValue: '$type' // Normalize
            }
        },

        // B. Union with Grammar Exercises
        {
            $unionWith: {
                coll: 'grammarexercises',
                pipeline: grammarPipeline
            }
        },

        // C. Sort (createdAt)
        { $sort: { createdAt: sortDir } },

        // D. Facet (Count Total & Paged Data)
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: limitNum },
                    // Optional: Lookup topic info for regular exercises (since we matched ID but want Name)
                    {
                        $lookup: {
                            from: 'topics',
                            localField: 'topicId',
                            foreignField: '_id',
                            as: 'topicInfo'
                        }
                    },
                    { $unwind: { path: '$topicInfo', preserveNullAndEmptyArrays: true } },
                    { $addFields: { topicName: '$topicInfo.name' } } // Flatten
                ]
            }
        }
    ];

    const result = await Exercise.aggregate(pipeline);

    // Format Result
    const metadata = result[0].metadata[0] || { total: 0 };
    const data = result[0].data || [];

    return {
        total: metadata.total,
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(metadata.total / limitNum),
        data: data
    };
};

const { createBulkDelete } = require('../utils/bulkDeleteHelper');
const bulkDeleteExercises = createBulkDelete(Exercise);

module.exports = {
    getExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    bulkDeleteExercises,
    getUnifiedExercises
};
