const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Topic = require('../src/model/Topic');
const Vocabulary = require('../src/model/Vocabulary');

const addFamilyVocab = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find the Family Topic
        const topicName = "Globalization & Social Integration";
        const topic = await Topic.findOne({
            name: { $regex: new RegExp(`^${topicName}$`, 'i') }
        });

        if (!topic) {
            console.error(`❌ Không tìm thấy chủ đề "${topicName}"`);
            process.exit(1);
        }
        console.log(`✅ Found Topic: ${topic.name} (${topic._id})`);

        // 2. Define new vocabulary items (3 per level)
        // Excluded: family, mother, father, parent, brother, sister, grandmother, grandfather, baby, child, son, daughter, aunt, uncle, cousin, grandparent
        const newVocabs = [
            // A1
            { word: 'world', meaning: 'thế giới', level: 'A1', type: 'noun', topic: topic._id, example: 'We live in a big world.' },
            { word: 'internet', meaning: 'mạng internet', level: 'A1', type: 'noun', topic: topic._id, example: 'The internet connects people everywhere.' },
            { word: 'travel', meaning: 'du hành', level: 'A1', type: 'verb', topic: topic._id, example: 'Many people travel to different countries.' },

            // A2
            { word: 'global', meaning: 'toàn cầu', level: 'A2', type: 'adjective', topic: topic._id, example: 'Climate change is a global problem.' },
            { word: 'connect', meaning: 'kết nối', level: 'A2', type: 'verb', topic: topic._id, example: 'Social media helps us connect with friends.' },
            { word: 'culture', meaning: 'văn hóa', level: 'A2', type: 'noun', topic: topic._id, example: 'I enjoy learning about Japanese culture.' },

            // B1
            { word: 'international', meaning: 'quốc tế', level: 'B1', type: 'adjective', topic: topic._id, example: 'They work for a large international company.' },
            { word: 'trade', meaning: 'thương mại', level: 'B1', type: 'noun', topic: topic._id, example: 'Free trade can help the economy grow.' },
            { word: 'support', meaning: 'hỗ trợ', level: 'B1', type: 'verb', topic: topic._id, example: 'The community helps to support new immigrants.' },

            // B2
            { word: 'cooperation', meaning: 'sự hợp tác', level: 'B2', type: 'noun', topic: topic._id, example: 'Economic cooperation between nations is increasing.' },
            { word: 'boundary', meaning: 'biên giới', level: 'B2', type: 'noun', topic: topic._id, example: 'In a digital age, information has no boundaries.' },
            { word: 'diverse', meaning: 'đa dạng', level: 'B2', type: 'adjective', topic: topic._id, example: 'The city has a very diverse population.' },

            // C1
            { word: 'outsourcing', meaning: 'thuê ngoài', level: 'C1', type: 'noun', topic: topic._id, example: 'Many firms use outsourcing to reduce labor costs.' },
            { word: 'interact', meaning: 'tương tác', level: 'C1', type: 'verb', topic: topic._id, example: 'The program allows students to interact with peers globally.' },
            { word: 'connectivity', meaning: 'khả năng kết nối', level: 'C1', type: 'noun', topic: topic._id, example: 'Improved connectivity has boosted international business.' },

            // C2
            { word: 'hegemony', meaning: 'quyền bá chủ', level: 'C2', type: 'noun', topic: topic._id, example: 'The cultural hegemony of the West is being challenged.' },
            { word: 'interdependence', meaning: 'sự phụ thuộc lẫn nhau', level: 'C2', type: 'noun', topic: topic._id, example: 'Globalization has created a deep economic interdependence.' },
            { word: 'transnational', meaning: 'xuyên quốc gia', level: 'C2', type: 'adjective', topic: topic._id, example: 'Transnational corporations play a huge role in the global economy.' }
        ];
        // 3. Insert items
        const result = await Vocabulary.insertMany(newVocabs);
        console.log(`✅ Successfully added ${result.length} new words to 'Family' topic.`);

        // Print summary
        console.log('\nAdded Words:');
        newVocabs.forEach(v => {
            console.log(`- [${v.level}] ${v.word}: ${v.meaning}`);
        });

    } catch (err) {
        console.error('❌ Error adding vocab:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

addFamilyVocab();
