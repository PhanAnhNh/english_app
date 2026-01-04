const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('MONGO_URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');

const mongoose = require('mongoose');
const Vocabulary = require('../src/model/Vocabulary');
const connectDB = require('../src/config/database');

const removeDuplicates = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected to MongoDB.');

        // 1. Group by 'word' and count duplicates
        const duplicates = await Vocabulary.aggregate([
            {
                $group: {
                    _id: { $toLower: "$word" }, // Case-insensitive check
                    count: { $sum: 1 },
                    docs: { $push: "$_id" } // Store all IDs
                }
            },
            {
                $match: {
                    count: { $gt: 1 } // Only groups with > 1 document
                }
            }
        ]);

        console.log(`Found ${duplicates.length} words with duplicates.`);

        let totalDeleted = 0;

        for (const group of duplicates) {
            const idsToDelete = group.docs.slice(1); // Keep the first one (0-index), delete the rest
            const result = await Vocabulary.deleteMany({ _id: { $in: idsToDelete } });
            totalDeleted += result.deletedCount;
            console.log(`- Word "${group._id}": Deleted ${result.deletedCount} duplicates.`);
        }

        console.log('--------------------------------------------------');
        console.log(`✅ Cleanup Complete. Total duplicates removed: ${totalDeleted}`);

    } catch (error) {
        console.error('Error removing duplicates:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

removeDuplicates();
