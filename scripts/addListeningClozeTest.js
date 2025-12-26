const mongoose = require('mongoose');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Topic = require('../src/model/Topic');
const Exercise = require('../src/model/Exercise');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const topicName = await askQuestion('Nhập tên chủ đề (Topic Name): ');

        const topic = await Topic.findOne({
            name: { $regex: new RegExp(`^${topicName.trim()}$`, 'i') }
        });

        if (!topic) {
            console.error(`❌ Không tìm thấy chủ đề: "${topicName}"`);
            process.exit(1);
        }

        console.log(`✅ Đã tìm thấy chủ đề: ${topic.name} (ID: ${topic._id})`);

        // Dữ liệu mẫu (Listening - Cloze Test)
        const rawExercises = [

            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "To stay [1], you should eat more [2] and vegetables."',
                audioUrl: 'To stay healthy, you should eat more fruit and vegetables.',
                correctAnswer: 'healthy/fruit',
                level: 'A1'
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "You need enough [1] and [2] to have energy."',
                audioUrl: 'You need enough sleep and water to have energy.',
                correctAnswer: 'sleep/water',
                level: 'A1'
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "I like to [1] in the morning or [2] to the gym."',
                audioUrl: 'I like to run in the morning or walk to the gym.',
                correctAnswer: 'run/walk',
                level: 'A2'
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "Avoid [1] and try to keep a [2]."',
                audioUrl: 'Avoid junk food and try to keep a balanced diet.',
                correctAnswer: 'junk food/balanced diet',
                level: 'B1'
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "Practicing [1] is a great way to reduce [2]."',
                audioUrl: 'Practicing yoga is a great way to reduce stress.',
                correctAnswer: 'yoga/stress',
                level: 'B1'
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "Exercise helps boost your [1] and prevents [2]."',
                audioUrl: 'Exercise helps boost your immune system and prevents obesity.',
                correctAnswer: 'immune system/obesity',
                level: 'B2'
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "A [1] lifestyle can be [2] to your long-term health."',
                audioUrl: 'A sedentary lifestyle can be detrimental to your long-term health.',
                correctAnswer: 'sedentary/detrimental',
                level: 'C2'
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "Good [1] and [2] are keys to longevity."',
                audioUrl: 'Good nutrition and metabolism are keys to longevity.',
                correctAnswer: 'nutrition/metabolism',
                level: 'C1'
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "Deep [1] helps the body reach a state of [2]."',
                audioUrl: 'Deep meditation helps the body reach a state of equilibrium.',
                correctAnswer: 'meditation/equilibrium',
                level: 'C2'
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "Regular [1] can [2] your mind and body."',
                audioUrl: 'Regular exercise can rejuvenate your mind and body.',
                correctAnswer: 'exercise/rejuvenate',
                level: 'C2'
            }
        ]
        const exercises = rawExercises.map(ex => ({
            ...ex,
            topicId: topic._id
        }));

        await Exercise.insertMany(exercises);
        console.log(`✅ Đã thêm thành công ${exercises.length} bài tập Listening (Cloze Test) vào chủ đề "${topic.name}".`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err);
        process.exit(1);
    }
};

seed();
