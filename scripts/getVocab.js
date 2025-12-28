const mongoose = require('mongoose');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Topic = require('../src/model/Topic');
const Vocabulary = require('../src/model/Vocabulary');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getVocabByTopic = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        rl.question('Nhập tên chủ đề (Topic Name): ', async (topicName) => {
            try {
                // Find Topic (case-insensitive)
                const topic = await Topic.findOne({
                    name: { $regex: new RegExp(`^${topicName}$`, 'i') }
                });

                if (!topic) {
                    console.log(`❌ Không tìm thấy chủ đề nào có tên là "${topicName}"`);
                    process.exit(0);
                }

                console.log(`✅ Đã tìm thấy chủ đề: ${topic.name} (ID: ${topic._id})`);

                // Find Vocabulary by Topic ID
                const vocabList = await Vocabulary.find({ topic: topic._id });

                if (vocabList.length === 0) {
                    console.log(`⚠️ Không có từ vựng nào trong chủ đề này.`);
                } else {
                    console.log(`\n📚 Danh sách từ vựng (${vocabList.length} từ):`);
                    console.log('------------------------------------------------');
                    vocabList.forEach((v, index) => {
                        console.log(`${index + 1}. ${v.word} - ${v.meaning} (${v.level || 'Unknown'})`);
                    });
                    console.log('------------------------------------------------');
                }

            } catch (err) {
                console.error('❌ Lỗi khi tìm kiếm:', err);
            } finally {
                await mongoose.connection.close();
                rl.close();
                process.exit(0);
            }
        });

    } catch (err) {
        console.error('❌ Kết nối database thất bại:', err);
        process.exit(1);
    }
};

getVocabByTopic();
