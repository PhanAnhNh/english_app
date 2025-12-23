const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Exercise = require('../src/model/Exercise');

async function deleteClozeExercises() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Đã kết nối MongoDB');

        // Tìm và xóa tất cả bài tập đục lỗ
        const result = await Exercise.deleteMany({ type: 'cloze_test' });

        console.log(`🚀 Đã xóa thành công ${result.deletedCount} bài tập đục lỗ (cloze_test)!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

deleteClozeExercises();
