const Vocabulary = require('../model/Vocabulary');
const AdminLog = require('../model/AdminLog');
const UserVocabulary = require('../model/UserVocabulary');

// vocabularyService.js - sửa hàm getVocabularies
const getVocabularies = async (filters) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc', level, topic, search } = filters;

    console.log("📝 GET vocabularies - Query filters:", filters);

    // Tạo bộ lọc
    let filter = {};

    if (level) filter.level = level;

    if (topic) {
        // Xử lý cả trường hợp topic là String hoặc ObjectId
        if (mongoose.Types.ObjectId.isValid(topic)) {
            filter.topic = new mongoose.Types.ObjectId(topic);
        } else {
            filter.topic = topic;
        }
    }

    if (search) filter.word = { $regex: search, $options: 'i' };

    console.log("🔍 MongoDB filter:", JSON.stringify(filter));

    const data = await Vocabulary.find(filter);
    console.log("✅ Found vocabularies:", data.length);

    return {
        total: data.length,
        page: parseInt(page),
        limit: parseInt(limit) || data.length,
        totalPages: Math.ceil(data.length / (parseInt(limit) || 1)),
        data
    };
};

const getVocabularyById = async (vocabId, userId) => {
    const item = await Vocabulary.findById(vocabId);
    if (!item) {
        throw new Error('Không tìm thấy từ vựng');
    }
    // --- LOGIC MỚI: XEM LÀ THUỘC ---
    if (userId) {
        try {
            await UserVocabulary.findOneAndUpdate(
                {
                    user: userId,
                    vocabulary: vocabId
                },
                {
                    status: 'memorized', // Đánh dấu là đã thuộc ngay lập tức
                    learnedAt: new Date() // Cập nhật thời gian học
                },
                {
                    upsert: true, // Nếu chưa có thì tạo mới, có rồi thì cập nhật
                    new: true
                }
            );
        } catch (err) {
            console.error("Lỗi cập nhật tiến độ khi xem từ:", err);
            // Không throw error ở đây để người dùng vẫn xem được nội dung từ vựng dù lỗi cập nhật tiến độ
        }
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

