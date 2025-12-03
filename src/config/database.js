const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Đã kết nối MongoDB thành công!');
    } catch (err) {
        console.error('❌ Lỗi kết nối MongoDB:', err);
        process.exit(1);
    }
};

module.exports = connectDB;