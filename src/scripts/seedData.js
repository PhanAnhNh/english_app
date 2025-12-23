const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Topic = require('../model/Topic');
const Vocabulary = require('../model/Vocabulary');
const Exercise = require('../model/Exercise');

const seedData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Create Topic
        const transportTopic = await Topic.create({
            name: 'Transportation',
            description: 'Learn basic words about means of transport, vehicles, and how to travel.',
            level: 'A1',
            imageUrl: 'https://img.freepik.com/free-vector/flat-design-public-transport-illustration_23-2149409160.jpg',
            order: 15
        });

        console.log('✅ Created Topic: Transportation (A1)');

        // 2. Create Vocabulary (16 từ cơ bản nhất cho A1)
        const vocabItems = [
            { word: 'car', meaning: 'xe hơi', level: 'A1', topic: transportTopic._id },
            { word: 'bus', meaning: 'xe buýt', level: 'A1', topic: transportTopic._id },
            { word: 'train', meaning: 'xe lửa', level: 'A1', topic: transportTopic._id },
            { word: 'plane', meaning: 'máy bay', level: 'A1', topic: transportTopic._id },
            { word: 'bike', meaning: 'xe đạp', level: 'A1', topic: transportTopic._id },
            { word: 'motorcycle', meaning: 'xe máy', level: 'A1', topic: transportTopic._id },
            { word: 'taxi', meaning: 'taxi', level: 'A1', topic: transportTopic._id },
            { word: 'boat', meaning: 'thuyền', level: 'A1', topic: transportTopic._id },
            { word: 'walk', meaning: 'đi bộ', level: 'A1', topic: transportTopic._id },
            { word: 'drive', meaning: 'lái xe', level: 'A1', topic: transportTopic._id },
            { word: 'ride', meaning: 'đi (xe đạp/xe máy)', level: 'A1', topic: transportTopic._id },
            { word: 'fly', meaning: 'bay (máy bay)', level: 'A1', topic: transportTopic._id },
            { word: 'station', meaning: 'ga (xe lửa/xe buýt)', level: 'A1', topic: transportTopic._id },
            { word: 'airport', meaning: 'sân bay', level: 'A1', topic: transportTopic._id },
            { word: 'road', meaning: 'đường', level: 'A1', topic: transportTopic._id },
            { word: 'ticket', meaning: 'vé', level: 'A1', topic: transportTopic._id }
        ];

        await Vocabulary.insertMany(vocabItems);
        console.log('✅ Created Vocabulary items (16 từ cơ bản A1)');

        // 3. Create Exercises (đủ 40 bài tập)
        const exercises = [
            // ==================== LISTENING - MULTIPLE CHOICE (15 bài) ====================
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What does the speaker use to go to school?',
                audioUrl: 'I go to school by bus every day.',
                options: [
                    { text: 'Bus', isCorrect: true },
                    { text: 'Car', isCorrect: false },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Boat', isCorrect: false }
                ],
                correctAnswer: 'Bus',
                explanation: 'Em đi học bằng xe buýt.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'How does the man travel to work?',
                audioUrl: 'I drive my car to work.',
                options: [
                    { text: 'Car', isCorrect: true },
                    { text: 'Bike', isCorrect: false },
                    { text: 'Train', isCorrect: false },
                    { text: 'Walk', isCorrect: false }
                ],
                correctAnswer: 'Car',
                explanation: 'Anh ấy lái xe hơi đi làm.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What do we take to fly?',
                audioUrl: 'We take a plane to fly.',
                options: [
                    { text: 'Plane', isCorrect: true },
                    { text: 'Bus', isCorrect: false },
                    { text: 'Bike', isCorrect: false },
                    { text: 'Taxi', isCorrect: false }
                ],
                correctAnswer: 'Plane',
                explanation: 'Chúng ta đi máy bay để bay.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'How does she go to the park?',
                audioUrl: 'She rides her bike to the park.',
                options: [
                    { text: 'Bike', isCorrect: true },
                    { text: 'Car', isCorrect: false },
                    { text: 'Train', isCorrect: false },
                    { text: 'Boat', isCorrect: false }
                ],
                correctAnswer: 'Bike',
                explanation: 'Cô ấy đi xe đạp đến công viên.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is fast for long trips?',
                audioUrl: 'A plane is fast for long trips.',
                options: [
                    { text: 'Plane', isCorrect: true },
                    { text: 'Walk', isCorrect: false },
                    { text: 'Bike', isCorrect: false },
                    { text: 'Bus', isCorrect: false }
                ],
                correctAnswer: 'Plane',
                explanation: 'Máy bay nhanh cho chuyến đi xa.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'How do we go to the station?',
                audioUrl: 'We take a taxi to the station.',
                options: [
                    { text: 'Taxi', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Boat', isCorrect: false },
                    { text: 'Bike', isCorrect: false }
                ],
                correctAnswer: 'Taxi',
                explanation: 'Chúng ta đi taxi đến ga.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What do people ride on the road?',
                audioUrl: 'People ride motorcycles on the road.',
                options: [
                    { text: 'Motorcycle', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Train', isCorrect: false },
                    { text: 'Boat', isCorrect: false }
                ],
                correctAnswer: 'Motorcycle',
                explanation: 'Người ta đi xe máy trên đường.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'How do we travel on water?',
                audioUrl: 'We travel on water by boat.',
                options: [
                    { text: 'Boat', isCorrect: true },
                    { text: 'Car', isCorrect: false },
                    { text: 'Bus', isCorrect: false },
                    { text: 'Train', isCorrect: false }
                ],
                correctAnswer: 'Boat',
                explanation: 'Chúng ta đi thuyền trên nước.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What do we need to take the train?',
                audioUrl: 'We need a ticket to take the train.',
                options: [
                    { text: 'Ticket', isCorrect: true },
                    { text: 'Bag', isCorrect: false },
                    { text: 'Pen', isCorrect: false },
                    { text: 'Book', isCorrect: false }
                ],
                correctAnswer: 'Ticket',
                explanation: 'Chúng ta cần vé để đi xe lửa.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'How does he go to the airport?',
                audioUrl: 'He drives his car to the airport.',
                options: [
                    { text: 'Car', isCorrect: true },
                    { text: 'Bike', isCorrect: false },
                    { text: 'Walk', isCorrect: false },
                    { text: 'Boat', isCorrect: false }
                ],
                correctAnswer: 'Car',
                explanation: 'Anh ấy lái xe hơi đến sân bay.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is slow but good for health?',
                audioUrl: 'Walking is slow but good for health.',
                options: [
                    { text: 'Walk', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Train', isCorrect: false },
                    { text: 'Taxi', isCorrect: false }
                ],
                correctAnswer: 'Walk',
                explanation: 'Đi bộ chậm nhưng tốt cho sức khỏe.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'Where do trains stop?',
                audioUrl: 'Trains stop at the station.',
                options: [
                    { text: 'Station', isCorrect: true },
                    { text: 'Airport', isCorrect: false },
                    { text: 'Road', isCorrect: false },
                    { text: 'School', isCorrect: false }
                ],
                correctAnswer: 'Station',
                explanation: 'Xe lửa dừng ở ga.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'Planes fly from the...',
                audioUrl: 'Planes fly from the airport.',
                options: [
                    { text: 'Airport', isCorrect: true },
                    { text: 'Station', isCorrect: false },
                    { text: 'Road', isCorrect: false },
                    { text: 'Playground', isCorrect: false }
                ],
                correctAnswer: 'Airport',
                explanation: 'Máy bay bay từ sân bay.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'Many people ride a... to work.',
                audioUrl: 'Many people ride a bus to work.',
                options: [
                    { text: 'Bus', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Boat', isCorrect: false },
                    { text: 'Train', isCorrect: false }
                ],
                correctAnswer: 'Bus',
                explanation: 'Nhiều người đi xe buýt đến chỗ làm.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What do we buy to travel?',
                audioUrl: 'We buy a ticket to travel.',
                options: [
                    { text: 'Ticket', isCorrect: true },
                    { text: 'Book', isCorrect: false },
                    { text: 'Pen', isCorrect: false },
                    { text: 'Bag', isCorrect: false }
                ],
                correctAnswer: 'Ticket',
                explanation: 'Chúng ta mua vé để đi lại.',
                level: 'A1',
                topicId: transportTopic._id
            },

            // ==================== READING - MULTIPLE CHOICE (15 bài) ====================
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'We drive a...',
                options: [
                    { text: 'Car', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Boat', isCorrect: false },
                    { text: 'Bike', isCorrect: false }
                ],
                correctAnswer: 'Car',
                explanation: 'Chúng ta lái xe hơi.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'Many people take the... to school.',
                options: [
                    { text: 'Bus', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Boat', isCorrect: false },
                    { text: 'Train', isCorrect: false }
                ],
                correctAnswer: 'Bus',
                explanation: 'Nhiều người đi xe buýt đến trường.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'We fly on a...',
                options: [
                    { text: 'Plane', isCorrect: true },
                    { text: 'Car', isCorrect: false },
                    { text: 'Bike', isCorrect: false },
                    { text: 'Taxi', isCorrect: false }
                ],
                correctAnswer: 'Plane',
                explanation: 'Chúng ta bay trên máy bay.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'I ride a... to the park.',
                options: [
                    { text: 'Bike', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Bus', isCorrect: false },
                    { text: 'Train', isCorrect: false }
                ],
                correctAnswer: 'Bike',
                explanation: 'Em đi xe đạp đến công viên.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'We walk when it is...',
                options: [
                    { text: 'Near', isCorrect: true },
                    { text: 'Far', isCorrect: false },
                    { text: 'High', isCorrect: false },
                    { text: 'Big', isCorrect: false }
                ],
                correctAnswer: 'Near',
                explanation: 'Chúng ta đi bộ khi gần.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'A fast way to travel far is by...',
                options: [
                    { text: 'Plane', isCorrect: true },
                    { text: 'Walk', isCorrect: false },
                    { text: 'Bike', isCorrect: false },
                    { text: 'Bus', isCorrect: false }
                ],
                correctAnswer: 'Plane',
                explanation: 'Cách nhanh để đi xa là bằng máy bay.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'We take a... when we need a ride.',
                options: [
                    { text: 'Taxi', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Boat', isCorrect: false },
                    { text: 'Train', isCorrect: false }
                ],
                correctAnswer: 'Taxi',
                explanation: 'Chúng ta đi taxi khi cần xe chở.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'People ride a... on the road.',
                options: [
                    { text: 'Motorcycle', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Boat', isCorrect: false },
                    { text: 'Train', isCorrect: false }
                ],
                correctAnswer: 'Motorcycle',
                explanation: 'Người ta đi xe máy trên đường.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'Trains stop at the...',
                options: [
                    { text: 'Station', isCorrect: true },
                    { text: 'Airport', isCorrect: false },
                    { text: 'Road', isCorrect: false },
                    { text: 'School', isCorrect: false }
                ],
                correctAnswer: 'Station',
                explanation: 'Xe lửa dừng ở ga.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'We buy a... to travel by train.',
                options: [
                    { text: 'Ticket', isCorrect: true },
                    { text: 'Book', isCorrect: false },
                    { text: 'Pen', isCorrect: false },
                    { text: 'Bag', isCorrect: false }
                ],
                correctAnswer: 'Ticket',
                explanation: 'Chúng ta mua vé để đi xe lửa.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'Planes land at the...',
                options: [
                    { text: 'Airport', isCorrect: true },
                    { text: 'Station', isCorrect: false },
                    { text: 'Road', isCorrect: false },
                    { text: 'Playground', isCorrect: false }
                ],
                correctAnswer: 'Airport',
                explanation: 'Máy bay hạ cánh ở sân bay.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'I go to school by...',
                options: [
                    { text: 'Bus', isCorrect: true },
                    { text: 'Plane', isCorrect: false },
                    { text: 'Boat', isCorrect: false },
                    { text: 'Train', isCorrect: false }
                ],
                correctAnswer: 'Bus',
                explanation: 'Em đi học bằng xe buýt.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'We drive on the...',
                options: [
                    { text: 'Road', isCorrect: true },
                    { text: 'Sky', isCorrect: false },
                    { text: 'Water', isCorrect: false },
                    { text: 'Air', isCorrect: false }
                ],
                correctAnswer: 'Road',
                explanation: 'Chúng ta lái xe trên đường.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'I ride a bike to...',
                options: [
                    { text: 'School', isCorrect: true },
                    { text: 'Airport', isCorrect: false },
                    { text: 'Station', isCorrect: false },
                    { text: 'Sea', isCorrect: false }
                ],
                correctAnswer: 'School',
                explanation: 'Em đi xe đạp đến trường.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'multiple_choice',
                questionText: 'We fly to another city by...',
                options: [
                    { text: 'Plane', isCorrect: true },
                    { text: 'Bus', isCorrect: false },
                    { text: 'Car', isCorrect: false },
                    { text: 'Walk', isCorrect: false }
                ],
                correctAnswer: 'Plane',
                explanation: 'Chúng ta bay đến thành phố khác bằng máy bay.',
                level: 'A1',
                topicId: transportTopic._id
            },

            // ==================== CLOZE TEST (5 bài) ====================
            {
                skill: 'reading',
                type: 'cloze_test',
                questionText: 'I go to school by [1]. My friend goes by [2].',
                correctAnswer: 'bus/bike',
                options: [],
                explanation: 'Điền: bus / bike.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'cloze_test',
                questionText: 'We take a [1] to fly. It is very [2].',
                correctAnswer: 'plane/fast',
                options: [],
                explanation: 'Điền: plane / fast.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'cloze_test',
                questionText: 'He rides a [1] to work. I drive a [2].',
                correctAnswer: 'motorcycle/car',
                options: [],
                explanation: 'Điền: motorcycle / car.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'cloze_test',
                questionText: 'We buy a [1] for the train at the [2].',
                correctAnswer: 'ticket/station',
                options: [],
                explanation: 'Điền: ticket / station.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'cloze_test',
                questionText: 'Planes fly from the [1]. Boats go on the [2].',
                correctAnswer: 'airport/water',
                options: [],
                explanation: 'Điền: airport / water.',
                level: 'A1',
                topicId: transportTopic._id
            },

            // ==================== FILL IN BLANK (5 bài) ====================
            {
                skill: 'reading',
                type: 'fill_in_blank',
                questionText: 'I go to school by [1].',
                correctAnswer: 'bus',
                options: [],
                explanation: 'Từ cần điền là bus.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'fill_in_blank',
                questionText: 'We fly on a [1].',
                correctAnswer: 'plane',
                options: [],
                explanation: 'Từ cần điền là plane.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'listening',
                type: 'fill_in_blank',
                questionText: 'He rides a [1] to the park.',
                audioUrl: 'He rides a bike to the park.',
                correctAnswer: 'bike',
                options: [],
                explanation: 'Từ cần điền là bike.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'fill_in_blank',
                questionText: 'We need a [1] for the train.',
                correctAnswer: 'ticket',
                options: [],
                explanation: 'Từ cần điền là ticket.',
                level: 'A1',
                topicId: transportTopic._id
            },
            {
                skill: 'reading',
                type: 'fill_in_blank',
                questionText: 'Planes stop at the [1].',
                correctAnswer: 'airport',
                options: [],
                explanation: 'Từ cần điền là airport.',
                level: 'A1',
                topicId: transportTopic._id
            }
        ];

        await Exercise.insertMany(exercises);
        console.log('✅ Created Exercises:', exercises.length, 'exercises');

        console.log('🚀 Seeding Transportation (A1) completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
