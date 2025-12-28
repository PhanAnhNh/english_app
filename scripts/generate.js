const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Exercise = require('../src/model/Exercise');
const Topic = require('../src/model/Topic'); // Import Topic model

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Đã kết nối tới MongoDB');

        // Kiểm tra API Key
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error('❌ Thiếu GEMINI_API_KEY hoặc GOOGLE_API_KEY trong file .env');
            process.exit(1);
        }

        const generateText = async (prompt) => {
            // Thử các model khác nhau nếu model chính bị lỗi
            // Ưu tiên model Gemma 3 27B như yêu cầu (gemma-3-27b-it)
            const models = ['gemma-3-27b-it', 'gemini-1.5-flash'];

            for (const model of models) {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                try {
                    const response = await axios.post(url, {
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    }, {
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                        return response.data.candidates[0].content.parts[0].text;
                    }
                } catch (err) {
                    const status = err.response ? err.response.status : 'N/A';
                    const data = err.response ? JSON.stringify(err.response.data) : err.message;
                    console.warn(`⚠️ Model ${model} lỗi (Status: ${status}): ${data}`);
                }
            }
            throw new Error('Tất cả các model đều thất bại.');
        };

        // Tìm các bài tập thiếu giải thích (Reading/Listening, Cloze/Fill)
        const exercises = await Exercise.find({
            skill: { $in: ['reading', 'listening'] },
            type: { $in: ['cloze_test', 'fill_in_blank'] },
            $or: [{ explanation: { $exists: false } }, { explanation: "" }, { explanation: null }]
        }).populate('topicId');

        console.log(`🔍 Tìm thấy ${exercises.length} bài tập thiếu giải thích.`);

        for (let i = 0; i < exercises.length; i++) {
            const ex = exercises[i];
            const words = ex.correctAnswer.split('/').map(w => w.trim());

            if (words.length === 0) continue;

            const topicName = ex.topicId ? ex.topicId.name : 'General Context';

            let prompt = '';

            // Nếu là Cloze Test (nhiều từ) -> Format có đánh số [1] [2]...
            if (words.length > 1 || ex.type === 'cloze_test') {
                prompt = `
                Context: The following words are related to the topic "${topicName}".
                Translate these English words to Vietnamese based on this context. 
                Format the output exactly as follows:
                "[1] word1: meaning1. [2] word2: meaning2. [3] word3: meaning3."
                
                Keep meanings short and relevant to "${topicName}".
                
                Words to translate: ${words.join(', ')}
                `;
            }
            // Nếu là Fill in Blank (1 từ) -> Format đơn giản "word: meaning"
            else {
                prompt = `
                Context: The word "${words[0]}" is related to the topic "${topicName}".
                Translate this English word to Vietnamese based on this context.
                Format the output exactly as follows:
                "word: meaning"
                
                Keep the meaning short and relevant to "${topicName}". Do not add numbering like [1].
                
                Word to translate: ${words[0]}
                `;
            }

            try {
                let text = await generateText(prompt);
                // Xử lý output: xóa dấu ngoặc kép thừa nếu có
                text = text ? text.trim().replace(/^"|"$/g, '') : '';

                if (text) {
                    console.log(`[${i + 1}/${exercises.length}] Chủ đề: ${topicName}`);
                    console.log(`   📝 Input: ${ex.correctAnswer}`);
                    console.log(`   ✨ Generated: ${text}`);
                    ex.explanation = text;
                    await ex.save();
                }

                // Tạm dừng 1 giây để tránh bị giới hạn tốc độ (Rate Limit)
                await new Promise(r => setTimeout(r, 1000));

            } catch (err) {
                console.error(`❌ Lỗi khi tạo giải thích cho "${ex.correctAnswer}":`, err.message);
            }
        }

        console.log('✅ Hoàn tất cập nhật giải thích.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi nghiệm trọng:', err);
        process.exit(1);
    }
};

seed();
