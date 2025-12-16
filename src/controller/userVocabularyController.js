const e = require('express');
const UserVocabulary = require('../model/UserVocabulary'); // Import model bạn đã tạo

// Hàm thêm từ vào từ điển cá nhân
exports.addToDictionary = async (req, res) => {
    try {
        const { vocabularyId } = req.body;
        const userId = req.user.id;

        if (!vocabularyId) {
            return res.status(400).json({ success: false, message: "Thiếu ID từ vựng" });
        }

        // Tìm xem đã có trong từ điển chưa
        let userVocab = await UserVocabulary.findOne({ user: userId, vocabulary: vocabularyId });

        if (userVocab) {

            userVocab.learnedAt = new Date();
            // userVocab.status = 'learning'; // <--- Bỏ dòng này nếu không muốn user bị reset việc học
            await userVocab.save();

            return res.status(200).json({
                success: true,
                message: "Từ này đã có trong từ điển của bạn.",
                data: userVocab
            });
        } else {
            // Nếu chưa có thì tạo mới với status learning
            userVocab = await UserVocabulary.create({
                user: userId,
                vocabulary: vocabularyId,
                status: 'memorized', // Mới thêm vào thì là đang học
                learnedAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Đã thêm vào từ điển thành công!",
                data: userVocab
            });
        }

    } catch (error) {
        console.error("Lỗi thêm từ vựng:", error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

exports.getUserDictionary = async (req, res) => {
    try {
        // Lấy ID của user từ Token (Middleware xác thực đã gắn vào req.user)
        const userId = req.user.id;
        const userDictionary = await UserVocabulary.find({ user: userId })
            .populate('vocabulary') // Giả định trường 'vocabulary' trong UserVocabulary là ObjectId trỏ tới Vocabulary Model
            .lean(); // Sử dụng .lean() để trả về plain JavaScript objects, giúp tăng hiệu suất

        // 3. Xử lý dữ liệu trả về (tùy chọn: lọc những bản ghi không có vocabulary)
        const vocabDetails = userDictionary
            .filter(item => item.vocabulary) // Đảm bảo chỉ lấy những bản ghi có từ vựng liên kết
            .map(item => ({
                // Trả về thông tin chi tiết của từ vựng và trạng thái học tập
                _id: item.vocabulary._id, // ID của từ vựng gốc
                word: item.vocabulary.word,
                meaning: item.vocabulary.meaning,
                type: item.vocabulary.type,
                pronunciation: item.vocabulary.pronunciation,
                imageUrl: item.vocabulary.imageUrl,
                // Trạng thái học tập của user
                status: item.status,
                learnedAt: item.learnedAt,
                userVocabId: item._id // ID của bản ghi UserVocabulary (nếu cần xóa/cập nhật)
            }));


        return res.status(200).json({
            success: true,
            message: "Lấy từ điển cá nhân thành công!",
            count: vocabDetails.length,
            data: vocabDetails,
        });

    } catch (error) {
        console.error("Lỗi lấy từ điển cá nhân:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy từ điển cá nhân"
        });
    }
};

// Xóa từ vựng khỏi từ điển cá nhân
exports.deleteFromDictionary = async (req, res) => {
    try {
        const userVocabId = req.params.id;
        const userId = req.user.id;

        if (!userVocabId) {
            return res.status(400).json({ success: false, message: "Thiếu ID bản ghi cần xóa" });
        }

        const result = await UserVocabulary.findOneAndDelete({
            _id: userVocabId,
            user: userId
        });

        if (!result) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hoặc bạn không có quyền xóa bản ghi này" });
        }

        return res.status(200).json({
            success: true,
            message: "Đã xóa từ vựng khỏi từ điển thành công!",
            deletedId: userVocabId
        });

    } catch (error) {
        console.error("Lỗi xóa từ vựng:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa từ vựng"
        });
    }
};

// Thay đổi trạng thái học tập (learning, reviewing, mastered, etc.)
exports.updateVocabStatus = async (req, res) => {
    try {
        const { userVocabId, newStatus } = req.body; // userVocabId là ID của bản ghi trong UserVocabulary (item._id)
        const userId = req.user.id;

        if (!userVocabId || !newStatus) {
            return res.status(400).json({ success: false, message: "Thiếu ID bản ghi hoặc trạng thái mới" });
        }

        const userVocab = await UserVocabulary.findOneAndUpdate(
            { _id: userVocabId, user: userId },
            { status: newStatus },
            { new: true } // Trả về dữ liệu đã cập nhật
        ).populate('vocabulary'); // Populate để trả về thông tin từ vựng đầy đủ

        if (!userVocab) {
            return res.status(404).json({ success: false, message: "Không tìm thấy từ vựng này trong từ điển cá nhân" });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thành công!",
            data: userVocab
        });

    } catch (error) {
        console.error("Lỗi cập nhật trạng thái từ vựng:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật trạng thái"
        });
    }
};