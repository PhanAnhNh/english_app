const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Exercise = require('../src/model/Exercise');

async function shuffleExistingExercises() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Đã kết nối MongoDB');

        // Tìm tất cả bài tập trắc nghiệm
        const exercises = await Exercise.find({ type: 'multiple_choice' });
        console.log(`🔍 Tìm thấy ${exercises.length} bài tập trắc nghiệm.`);

        // Hàm trộn mảng ngẫu nhiên (Fisher-Yates shuffle)
        const shuffleArray = (array) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        };

        let updatedCount = 0;

        for (const ex of exercises) {
            if (ex.options && ex.options.length > 0) {
                // Lưu lại đáp án đúng trước khi trộn (nếu cần kiểm tra, nhưng ở đây ta trộn cả object chứa isCorrect)
                ex.options = shuffleArray(ex.options);

                // Đánh dấu field options đã thay đổi để mongoose nhận biết và save
                ex.markModified('options');

                await ex.save();
                updatedCount++;
            }
        }

        console.log(`🚀 Đã xáo trộn thành công ${updatedCount}/${exercises.length} bài tập!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

shuffleExistingExercises();
