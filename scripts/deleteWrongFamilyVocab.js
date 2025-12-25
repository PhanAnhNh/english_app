const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Topic = require('../src/model/Topic');
const Vocabulary = require('../src/model/Vocabulary');

const deleteVocab = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find the Family Topic to be sure
        const topicName = "Family";
        const topic = await Topic.findOne({
            name: { $regex: new RegExp(`^${topicName}$`, 'i') }
        });

        if (!topic) {
            console.error(`❌ Không tìm thấy chủ đề "${topicName}"`);
            process.exit(1);
        }
        console.log(`✅ Found Topic: ${topic.name} (${topic._id})`);

        // 2. List of words to delete
        const wordsToDelete = [
            'traffic', 'driver', 'map',
            'passenger', 'journey', 'bridge',
            'vehicle', 'delay', 'route',
            'commute', 'destination', 'pedestrian',
            'infrastructure', 'congestion', 'accessibility',
            'gridlock', 'logistics', 'locomotion'
        ];

        // 3. Delete items
        const result = await Vocabulary.deleteMany({
            topic: topic._id,
            word: { $in: wordsToDelete }
        });

        console.log(`✅ Successfully deleted ${result.deletedCount} words from 'Family' topic.`);

    } catch (err) {
        console.error('❌ Error deleting vocab:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

deleteVocab();
