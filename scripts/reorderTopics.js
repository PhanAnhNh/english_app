const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Topic = require('../src/model/Topic');

/**
 * HƯỚNG DẪN SỬ DỤNG:
 * 1. Chỉnh sửa đối tượng `TOPIC_ORDER` bên dưới: 'Tên Topic': Số thứ tự.
 * 2. Lưu file và chạy lệnh: node scripts/reorderTopics.js
 */
const TOPIC_ORDER = {
    'Greetings': 1,
    'Family': 2,
    'School': 3,
    'Jobs': 4,
    'Transportation': 5,
    'Weather': 6,
    'Food': 7,
    'Clothes': 8,
    'Colors': 9,
    'Animals': 10,
    'Flowers': 11,
    'Lifestyle & Health': 12,
    // Thêm các Topic khác vào đây...
};

async function reorderTopics() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Đã kết nối MongoDB');

        console.log('\n--- Đang bắt đầu sắp xếp lại Topic ---');

        let updatedCount = 0;
        const topicNames = Object.keys(TOPIC_ORDER);

        for (const topicName of topicNames) {
            const orderValue = TOPIC_ORDER[topicName];

            const result = await Topic.findOneAndUpdate(
                { name: { $regex: new RegExp(`^${topicName}$`, 'i') } }, // Tìm không phân biệt hoa thường
                { order: orderValue },
                { new: true }
            );

            if (result) {
                console.log(`✨ [${orderValue}] Cập nhật thành công: ${result.name}`);
                updatedCount++;
            } else {
                console.log(`❌ Không tìm thấy Topic có tên: "${topicName}"`);
            }
        }

        // Liệt kê các topic còn lại chưa có trong danh sách trên (nếu có)
        const others = await Topic.find({
            name: { $nin: topicNames.map(name => new RegExp(`^${name}$`, 'i')) }
        });

        if (others.length > 0) {
            console.log('\n--- Các Topic chưa được sắp xếp (đang giữ order cũ) ---');
            others.forEach(t => console.log(`- ${t.name} (Order: ${t.order})`));
        }

        console.log(`\n✅ Hoàn tất! Đã cập nhật ${updatedCount} Topic.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

reorderTopics();
