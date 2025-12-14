const Listening = require('../service/listeninService'); // Đường dẫn tới file model của bạn

// 1. Tạo mới một bài nghe (CREATE)
exports.createListening = async (req, res) => {
    try {
        const newListening = new Listening(req.body);
        const savedListening = await newListening.save();
        res.status(201).json(savedListening);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi tạo bài nghe', error: error.message });
    }
};

// 2. Lấy danh sách bài nghe (READ ALL)
// Hỗ trợ lọc theo level và topic: /api/listenings?level=B1&topic=Travel
exports.getAllListenings = async (req, res) => {
    try {
        const { level, topic } = req.query;
        let query = {};

        // Nếu có param level hoặc topic trên URL thì thêm vào điều kiện lọc
        if (level) query.level = level;
        if (topic) query.topic = topic;

        const listenings = await Listening.find(query).sort({ createdAt: -1 }); // Mới nhất lên đầu
        res.status(200).json(listenings);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách', error: error.message });
    }
};

// 3. Lấy chi tiết một bài nghe theo ID (READ ONE)
exports.getListeningById = async (req, res) => {
    try {
        const listening = await Listening.findById(req.params.id);
        if (!listening) {
            return res.status(404).json({ message: 'Không tìm thấy bài nghe này' });
        }
        res.status(200).json(listening);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 4. Cập nhật bài nghe (UPDATE)
exports.updateListening = async (req, res) => {
    try {
        const updatedListening = await Listening.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Trả về dữ liệu mới sau khi update
        );

        if (!updatedListening) {
            return res.status(404).json({ message: 'Không tìm thấy bài nghe để cập nhật' });
        }
        res.status(200).json(updatedListening);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi cập nhật', error: error.message });
    }
};

// 5. Xóa bài nghe (DELETE)
exports.deleteListening = async (req, res) => {
    try {
        const deletedListening = await Listening.findByIdAndDelete(req.params.id);
        if (!deletedListening) {
            return res.status(404).json({ message: 'Không tìm thấy bài nghe để xóa' });
        }
        res.status(200).json({ message: 'Đã xóa bài nghe thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa', error: error.message });
    }
};