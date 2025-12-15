const Listening = require('../model/Listening'); // Đường dẫn tới file model của bạn

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

exports.getAllListenings = async (req, res) => {
    try {
        // 1. Lấy tất cả tham số từ URL (query string)
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt', // Mặc định sắp xếp theo ngày tạo
            sortOrder = 'desc',   // Mặc định giảm dần
            level,
            topic,
            search
        } = req.query;

        let filter = {};

        // 2. Xây dựng bộ lọc (Filter)
        if (level) filter.level = level;
        if (topic) filter.topic = topic;

        // Tìm kiếm (Search)
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { transcript: { $regex: search, $options: 'i' } },
            ];
        }

        // 3. Xử lý sắp xếp (Sort)
        const sortOptions = {};
        // Nếu sortOrder là 'asc' thì 1, ngược lại là -1
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // 4. Tính toán phân trang (Pagination)
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // 5. Query Database
        // Đếm tổng số lượng bản ghi thỏa mãn điều kiện lọc
        const total = await Listening.countDocuments(filter);

        // Lấy dữ liệu
        const listenings = await Listening.find(filter)
            .sort(sortOptions)      // Áp dụng sắp xếp động
            .skip(skip)             // Bỏ qua số lượng bản ghi trang trước
            .limit(limitNumber);    // Giới hạn số lượng bản ghi trả về

        // 6. Trả về kết quả kèm thông tin phân trang
        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            },
            data: listenings
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách',
            error: error.message
        });
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