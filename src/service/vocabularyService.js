const Vocabulary = require('../model/Vocabulary');
const AdminLog = require('../model/AdminLog');


const getVocabularies = async (filters) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc', level, topic, search } = filters;

    // Tạo bộ lọc
    let filter = {};
    if (level) filter.level = level;
    if (topic) filter.topic = topic;
    if (search) filter.word = { $regex: search, $options: 'i' };

    // Tính toán phân trang
    const skip = (page - 1) * limit;
    const total = await Vocabulary.countDocuments(filter);

    // Query dữ liệu
    const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
    const data = await Vocabulary.find(filter)
        .sort({ [sortBy]: sortOrderNum })
        .skip(skip)
        .limit(limit);

    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data
    };
};

const getVocabularyById = async (vocabId) => {
    const item = await Vocabulary.findById(vocabId);
    if (!item) {
        throw new Error('Không tìm thấy từ vựng');
    }
    return item;
};

const createVocabulary = async (vocabData, adminId) => {

    const item = new Vocabulary(vocabData);
    await item.save();
    await AdminLog.create({ adminId, action: 'create_vocab', meta: { id: item._id } });
    return item;
};

const updateVocabulary = async (vocabId, vocabData) => {

    const updated = await Vocabulary.findByIdAndUpdate(vocabId, vocabData, { new: true });
    return updated;
};

const deleteVocabulary = async (vocabId) => {
    const vocabulary = await Vocabulary.findById(vocabId);
    if (!vocabulary) {
        throw new Error('Không tìm thấy từ vựng');
    }

    // Xóa files trên Cloudinary


    await Vocabulary.findByIdAndDelete(vocabId);
    return { message: 'Đã xóa thành công' };
};

module.exports = {
    getVocabularies,
    getVocabularyById,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary
};

