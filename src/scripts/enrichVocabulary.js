const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Vocabulary = require('../model/Vocabulary');
const { fetchWordData, fetchImageUrl } = require('./dictionaryService');

async function enrichData() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Đã kết nối MongoDB');

        const vocabItems = await Vocabulary.find({
            $or: [
                { pronunciation: { $exists: false } },
                { pronunciation: null },
                { example: { $exists: false } },
                { example: null },
                { audioUrl: { $exists: false } },
                { audioUrl: null },
                { type: { $exists: false } },
                { type: null },
                { imageUrl: { $exists: false } },
                { imageUrl: null }
            ]
        });

        console.log(`🔍 Tìm thấy ${vocabItems.length} từ cần bổ sung thông tin.`);

        for (const item of vocabItems) {
            const scrapedData = await fetchWordData(item.word);

            if (scrapedData.pronunciation || scrapedData.example || scrapedData.audioUrl || !item.imageUrl || !item.type) {
                item.pronunciation = item.pronunciation || scrapedData.pronunciation;
                item.example = item.example || scrapedData.example;
                item.audioUrl = item.audioUrl || scrapedData.audioUrl;
                item.type = item.type || scrapedData.type;

                // Nếu chưa có ảnh, tìm ảnh
                if (!item.imageUrl) {
                    const imageUrl = await fetchImageUrl(item.word);
                    if (imageUrl) {
                        item.imageUrl = imageUrl;
                    }
                }

                await item.save();
                console.log(`✅ Đã cập nhật từ: ${item.word}`);
            } else {
                console.log(`⚠️ Không tìm thấy thông tin bổ sung cho từ: ${item.word}`);
            }

            // Nghỉ một chút để tránh bị block (1 giây)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('🚀 Hoàn thành việc bổ sung dữ liệu từ vựng!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

enrichData();
