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
        const topicName = "Colors";
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
            { word: 'silver', meaning: 'màu bạc', level: 'A1', type: 'adjective', topic: topic._id, example: 'She wore a beautiful silver ring.' },
            { word: 'gold', meaning: 'màu vàng kim', level: 'A1', type: 'adjective', topic: topic._id, example: 'The Olympic winner got a gold medal.' },
            { word: 'rainbow', meaning: 'cầu vồng', level: 'A1', type: 'noun', topic: topic._id, example: 'Look at the colorful rainbow in the sky!' },

            // A2
            { word: 'blonde', meaning: 'vàng hoe (tóc)', level: 'A2', type: 'adjective', topic: topic._id, example: 'The little girl has long blonde hair.' },
            { word: 'navy', meaning: 'xanh đen', level: 'A2', type: 'adjective', topic: topic._id, example: 'His school uniform is navy blue.' },
            { word: 'cream', meaning: 'màu kem', level: 'A2', type: 'adjective', topic: topic._id, example: 'The walls were painted a soft cream color.' },

            // B1
            { word: 'shade', meaning: 'sắc thái màu', level: 'B1', type: 'noun', topic: topic._id, example: 'There are many different shades of green in the forest.' },
            { word: 'pale', meaning: 'nhợt nhạt', level: 'B1', type: 'adjective', topic: topic._id, example: 'She looked a bit pale after the long flight.' },
            { word: 'vivid', meaning: 'sặc sỡ', level: 'B1', type: 'adjective', topic: topic._id, example: 'The artist uses vivid colors in his paintings.' },

            // B2
            { word: 'neutral', meaning: 'trung tính', level: 'B2', type: 'adjective', topic: topic._id, example: 'She prefers neutral colors like beige for her home.' },
            { word: 'transparent', meaning: 'trong suốt', level: 'B2', type: 'adjective', topic: topic._id, example: 'The water in the lake was so transparent.' },
            { word: 'pastel', meaning: 'màu phấn nhạt', level: 'B2', type: 'adjective', topic: topic._id, example: 'The baby\'s room was decorated in pastel colors.' },

            // C1
            { word: 'vibrant', meaning: 'rực rỡ', level: 'C1', type: 'adjective', topic: topic._id, example: 'The city is famous for its vibrant street art.' },
            { word: 'monochrome', meaning: 'đơn sắc', level: 'C1', type: 'adjective', topic: topic._id, example: 'The photographer is known for his monochrome portraits.' },
            { word: 'fluorescent', meaning: 'huỳnh quang', level: 'C1', type: 'adjective', topic: topic._id, example: 'Cyclists often wear fluorescent jackets for safety.' },

            // C2
            { word: 'hue', meaning: 'sắc độ', level: 'C2', type: 'noun', topic: topic._id, example: 'The sunset filled the sky with various orange hues.' },
            { word: 'iridescent', meaning: 'óng ánh', level: 'C2', type: 'adjective', topic: topic._id, example: 'Soap bubbles have an iridescent surface.' },
            { word: 'opaque', meaning: 'mờ đục', level: 'C2', type: 'adjective', topic: topic._id, example: 'The windows were painted with an opaque film.' }
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
