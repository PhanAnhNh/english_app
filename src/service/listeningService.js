const Listening = require('../model/Listening'); // Đảm bảo đường dẫn đúng tới model

// 1. Lấy danh sách (Có phân trang, lọc, tìm kiếm, sắp xếp)
const getListenings = async (filters) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc', // Mặc định giảm dần (mới nhất lên đầu)
        level,
        topic,
        search
    } = filters;

    let filter = {};

    // Lọc chính xác theo Level và Topic
    if (level) filter.level = level;
    if (topic) filter.topic = topic;

    // Tìm kiếm tương đối (Search)
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },      // Tìm trong tiêu đề
            { transcript: { $regex: search, $options: 'i' } }, // Tìm trong nội dung bài nghe
        ];
    }

    // Xử lý sắp xếp
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Tính toán phân trang
    const skip = (page - 1) * limit;

    // Query Database
    const total = await Listening.countDocuments(filter);
    const data = await Listening.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    return {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        data
    };
};

// 2. Lấy chi tiết theo ID
const getListeningById = async (id) => {
    const item = await Listening.findById(id);
    if (!item) {
        throw new Error('Không tìm thấy bài nghe này');
    }
    return item;
};

// 3. Tạo mới
const createListening = async (data) => {
    const newItem = new Listening(data);
    await newItem.save();
    return newItem;
};

// 4. Cập nhật
const updateListening = async (id, data) => {
    const updatedItem = await Listening.findByIdAndUpdate(id, data, { new: true });
    if (!updatedItem) {
        throw new Error('Không tìm thấy bài nghe để cập nhật');
    }
    return updatedItem;
};

// 5. Xóa
const deleteListening = async (id) => {
    const deletedItem = await Listening.findByIdAndDelete(id);
    if (!deletedItem) {
        throw new Error('Không tìm thấy bài nghe để xóa');
    }
    return { message: 'Đã xóa thành công bài nghe' };
};

module.exports = {
    getListenings,
    getListeningById,
    createListening,
    updateListening,
    deleteListening
};