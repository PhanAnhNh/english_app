const Vocabulary = require('../model/Vocabulary');
const Topic = require('../model/Topic');
const AdminLog = require('../model/AdminLog');
const UserVocabulary = require('../model/UserVocabulary');
const mongoose = require('mongoose');

const getVocabularies = async (filters) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc', level, topic, search } = filters;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        console.log("🚀 ========== GET VOCABULARIES CALLED ==========");
        console.log("📦 Query params:", { topic, level, search, page: pageNum, limit: limitNum });

        // Tạo bộ lọc
        let filter = {};

        // Xử lý level
        if (level) {
            filter.level = level;
            console.log("🎯 Filter by level:", level);
        }

        // Xử lý topic - QUAN TRỌNG
        if (topic) {
            console.log("🎯 Topic received:", topic);
            console.log("🔧 Type of topic:", typeof topic);

            // KIỂM TRA MONGODB CONNECTION
            console.log("🔌 Mongoose connection state:", mongoose.connection.readyState);

            // THỬ CÁCH XỬ LÝ LINH HOẠT
            try {
                if (mongoose.Types.ObjectId.isValid(topic)) {
                    filter.topic = new mongoose.Types.ObjectId(topic);
                } else {
                    // Nếu topic không phải ObjectId hợp lệ, có thể user đang gửi name? 
                    // Nhưng schema là ObjectId, nên query string sẽ fail cast hoặc không ra kết quả.
                    // Để an toàn và đồng bộ ID, ta chỉ query khi đúng format.
                    console.warn("⚠️ Received invalid ObjectId for topic filter:", topic);
                }
            } catch (mongooseError) {
                console.error("❌ Mongoose error:", mongooseError);
                // Fallback: dùng string
                filter.topic = topic;
            }
        }

        if (search) {
            filter.word = { $regex: search, $options: 'i' };
            console.log("🔍 Search filter:", search);
        }

        console.log("🎯 Final filter for query:", JSON.stringify(filter, null, 2));

        // Get Total Count first
        const total = await Vocabulary.countDocuments(filter);

        // Build Query
        let query = Vocabulary.find(filter)
            .populate('topic', 'name')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

        // Apply Pagination ONLY if limit is provided and valid
        if (limit && !isNaN(parseInt(limit))) {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;
            query = query.skip(skip).limit(limitNum);
        }

        const data = await query;

        console.log("✅ Query executed successfully");
        console.log("📊 Number of vocabularies found:", data.length);

        // LOG MỘT SỐ KẾT QUẢ
        if (data.length > 0) {
            data.slice(0, 3).forEach((item, index) => {
                console.log(`📖 Item ${index + 1}:`, {
                    word: item.word,
                    topic: item.topic,
                    level: item.level,
                    topicType: typeof item.topic
                });
            });
        } else {
            console.log("📭 No vocabularies found with current filter");

            // DEBUG: Tìm tất cả để xem có gì trong DB
            const allVocab = await Vocabulary.find({}).limit(5);
            console.log("🔍 First 5 vocabularies in DB:");
            allVocab.forEach(item => {
                console.log(`  - ${item.word} (topic: ${item.topic}, level: ${item.level})`);
            });
        }

        return {
            total: total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            data
        };

    } catch (error) {
        console.error("💥 ERROR in getVocabularies:", error);
        console.error("💥 Error stack:", error.stack);
        throw new Error(`Failed to get vocabularies: ${error.message}`);
    }
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
    const vocabulary = await Vocabulary.findById(vocabId);
    if (!vocabulary) {
        throw new Error('Không tìm thấy từ vựng');
    }

    // Xóa files trên Cloudinary


    await Vocabulary.findByIdAndDelete(vocabId);
    return { message: 'Đã xóa thành công' };
};

const getDistinctTypes = async () => {
    try {
        // Lấy tất cả các giá trị type duy nhất từ collection
        const types = await Vocabulary.distinct('type');

        // Lọc bỏ giá trị null, undefined, empty string
        const validTypes = types.filter(type => type && type.trim() !== '');

        // Sắp xếp theo alphabet
        validTypes.sort();

        return validTypes;
    } catch (error) {
        console.error("💥 ERROR in getDistinctTypes:", error);
        throw new Error(`Failed to get distinct types: ${error.message}`);
    }
};

module.exports = {
    getVocabularies,
    getVocabularyById,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary,
    getDistinctTypes
};

