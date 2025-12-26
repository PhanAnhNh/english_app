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

        // Dữ liệu mẫu (Reading - Cloze Test)
        const rawExercises = [

            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [shirt, jeans, jacket]. \n For a relaxed weekend, I usually wear a simple white [1] and a pair of blue [2]. If it gets cold in the evening, I always bring a leather [3] to stay warm.',
                correctAnswer: 'shirt/jeans/jacket',
                level: 'A1'
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [dress, skirt, socks]. \n She decided to wear a long floral [1] to the party. However, her younger sister preferred wearing a short [2] with white [3] and sneakers.',
                correctAnswer: 'dress/skirt/socks',
                level: 'A1'
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [hoodie, shorts, gloves]. \n When he goes jogging in the winter, he wears a thick [1] and warm [2] to protect his hands. In the summer, he just wears [3] and a T-shirt.',
                correctAnswer: 'hoodie/gloves/shorts',
                level: 'A2'
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [suit, pocket, button]. \n He looked very sharp in his new [1]. He reached into his coat [2] to find a spare [3] because one had fallen off his sleeve.',
                correctAnswer: 'suit/pocket/button',
                level: 'A2'
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [tight, fashionable, casual]. \n These pants are a bit too [1] around the waist, so they aren\'t very comfortable. I prefer [2] clothes for daily wear, even if they aren\'t the most [3] style.',
                correctAnswer: 'tight/casual/fashionable',
                level: 'B1'
            }
            ,
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [fabric, sleeve, accessories]. \n The [1] of this sweater is made from high-quality wool. It has a long [2] that covers the wrist, and it looks great when paired with the right [3] like a silver watch.',
                correctAnswer: 'fabric/sleeve/accessories',
                level: 'B2'
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [garment, elegant, attire]. \n The invitation states that formal [1] is required for the gala. She chose an [2] silk [3] that was handmade by a famous designer.',
                correctAnswer: 'attire/elegant/garment',
                level: 'C1'
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [flamboyant, bespoke, fashionable]. \n High-end celebrities often order [1] suits that are made specifically for their body shape. Some prefer a [2] look with bright colors to stand out, while others stick to classic, [3] trends.',
                correctAnswer: 'bespoke/flamboyant/fashionable',
                level: 'C2'
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [tight, sleeve, pocket]. \n I can\'t put my wallet in this [1] because the jeans are too [2]. I should have checked the fit before I rolled up my [3] to try them on.',
                correctAnswer: 'pocket/tight/sleeve',
                level: 'B2'
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [attire, casual, accessories]. \n For a job interview, your [1] should be professional rather than [2]. Don\'t forget that small [3], such as a neat belt, can make a big difference.',
                correctAnswer: 'attire/casual/accessories',
                level: 'C1'
            }
        ]

        const exercises = rawExercises.map(ex => ({
            ...ex,
            topicId: topic._id
        }));

        await Exercise.insertMany(exercises);
        console.log(`✅ Đã thêm thành công ${exercises.length} bài tập Reading (Cloze Test) vào chủ đề "${topic.name}".`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err);
        process.exit(1);
    }
};

seed();
