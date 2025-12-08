const UserVocabulary = require('../model/UserVocabulary'); // Import model bạn đã tạo

// Hàm thêm từ vào từ điển cá nhân
exports.addToDictionary = async (req, res) => {
    try {
        const { vocabularyId } = req.body; // Lấy ID của từ vựng gửi từ Frontend
        const userId = req.user.id; // Lấy ID của user từ Token (Middleware xác thực)

        if (!vocabularyId) {
            return res.status(400).json({ success: false, message: "Thiếu ID từ vựng" });
        }

        // Sử dụng findOneAndUpdate với option upsert: true
        // Nghĩa là: Tìm xem user này đã lưu từ này chưa.
        // - Nếu tìm thấy: Cập nhật lại ngày học (learnedAt).
        // - Nếu chưa tìm thấy: Tạo bản ghi mới.
        const userVocab = await UserVocabulary.findOneAndUpdate(
            { user: userId, vocabulary: vocabularyId }, // Điều kiện tìm
            {
                status: 'learning', // Mặc định trạng thái là đang học
                learnedAt: new Date()
            }, // Dữ liệu cập nhật/tạo mới
            { new: true, upsert: true } // Option: trả về dữ liệu mới nhất, tạo nếu chưa có
        );

        return res.status(200).json({
            success: true,
            message: "Đã thêm vào từ điển của bạn thành công!",
            data: userVocab
        });

    } catch (error) {
        console.error("Lỗi thêm từ vựng:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi thêm từ vựng"
        });
    }
};