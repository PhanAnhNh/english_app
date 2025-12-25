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
        const topicName = "Transportation";
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
            { word: 'traffic', meaning: 'giao thông', level: 'A1', type: 'noun', topic: topic._id, example: 'There is a lot of traffic on the road today.' },
            { word: 'driver', meaning: 'tài xế', level: 'A1', type: 'noun', topic: topic._id, example: 'The bus driver was very friendly.' },
            { word: 'map', meaning: 'bản đồ', level: 'A1', type: 'noun', topic: topic._id, example: 'I am looking at the map to find the way.' },

            // A2
            { word: 'passenger', meaning: 'hành khách', level: 'A2', type: 'noun', topic: topic._id, example: 'The plane was carrying 200 passengers.' },
            { word: 'journey', meaning: 'cuộc hành trình', level: 'A2', type: 'noun', topic: topic._id, example: 'They began their long journey across Europe.' },
            { word: 'bridge', meaning: 'cây cầu', level: 'A2', type: 'noun', topic: topic._id, example: 'We drove across the Golden Gate Bridge.' },

            // B1
            { word: 'vehicle', meaning: 'phương tiện giao thông', level: 'B1', type: 'noun', topic: topic._id, example: 'The police are looking for a stolen vehicle.' },
            { word: 'delay', meaning: 'sự chậm trễ/trì hoãn', level: 'B1', type: 'noun', topic: topic._id, example: 'The flight was cancelled after a long delay.' },
            { word: 'route', meaning: 'tuyến đường, lộ trình', level: 'B1', type: 'noun', topic: topic._id, example: 'What is the fastest route to the city center?' },

            // B2
            { word: 'commute', meaning: 'quãng đường đi làm hàng ngày', level: 'B2', type: 'noun', topic: topic._id, example: 'She has a long commute from the suburbs to the city.' },
            { word: 'destination', meaning: 'điểm đến', level: 'B2', type: 'noun', topic: topic._id, example: 'We arrived at our destination after six hours.' },
            { word: 'pedestrian', meaning: 'người đi bộ', level: 'B2', type: 'noun', topic: topic._id, example: 'The area is reserved for pedestrians only.' },

            // C1
            { word: 'infrastructure', meaning: 'cơ sở hạ tầng', level: 'C1', type: 'noun', topic: topic._id, example: 'The government is investing in new transport infrastructure.' },
            { word: 'congestion', meaning: 'sự tắc nghẽn', level: 'C1', type: 'noun', topic: topic._id, example: 'The new highway was built to reduce traffic congestion.' },
            { word: 'accessibility', meaning: 'khả năng tiếp cận', level: 'C1', type: 'noun', topic: topic._id, example: 'The station has improved its accessibility for disabled people.' },

            // C2
            { word: 'gridlock', meaning: 'tình trạng giao thông đình trệ (tắc nghẽn hoàn toàn)', level: 'C2', type: 'noun', topic: topic._id, example: 'A strike by bus drivers caused gridlock throughout the city.' },
            { word: 'logistics', meaning: 'hậu cần/vận tải', level: 'C2', type: 'noun', topic: topic._id, example: 'The company needs to improve its delivery logistics.' },
            { word: 'locomotion', meaning: 'sự vận động/sự di chuyển', level: 'C2', type: 'noun', topic: topic._id, example: 'Steam engines were the main mode of locomotion in the 19th century.' }
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
