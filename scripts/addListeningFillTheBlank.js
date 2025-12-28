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

        // Dữ liệu mẫu (Listening - Fill in Blank)
        const rawExercises = [

            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What is the woman’s first name? Her [1].',
                audioUrl: 'Hello, my name is Sarah, and it is very nice to meet you.',
                correctAnswer: 'name',
                level: 'A1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What time of day is it? It is [1].',
                audioUrl: 'Good morning, everyone! I hope you all had a good night’s sleep.',
                correctAnswer: 'morning',
                level: 'A1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What does the man want to do? [1] his friend.',
                audioUrl: 'I would like to introduce my best friend, Mark, to the team.',
                correctAnswer: 'introduce',
                level: 'A2'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'Who is waiting at the front door? A [1].',
                audioUrl: 'There is a visitor waiting for you at the office entrance.',
                correctAnswer: 'visitor',
                level: 'A2'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'How should you speak to elders? Be [1].',
                audioUrl: 'It is important to be polite and say thank you when someone helps you.',
                correctAnswer: 'polite',
                level: 'B1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What are the two people having? A [1].',
                audioUrl: 'They are having a long conversation about their summer holidays.',
                correctAnswer: 'conversation',
                level: 'B1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'How did the host welcome the guests? She [1] them.',
                audioUrl: 'She stood at the door to greet every guest with a warm smile.',
                correctAnswer: 'greeted',
                level: 'B1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What did the man send to his neighbor? An [1].',
                audioUrl: 'I sent an invite to my neighbor for the housewarming party.',
                correctAnswer: 'invite',
                level: 'A2'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What do you say before you go to sleep? [1].',
                audioUrl: 'Good night, Mom! See you in the morning.',
                correctAnswer: 'Good night',
                level: 'A1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What did the woman say when she left? [1].',
                audioUrl: 'I have to go now. Goodbye and thank you for the tea.',
                correctAnswer: 'Goodbye',
                level: 'A1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What kind of event is it? A [1] dinner.',
                audioUrl: 'Please wear a suit, as this will be a very formal dinner.',
                correctAnswer: 'formal',
                level: 'B2'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'Where will the guests be welcomed? At the [1].',
                audioUrl: 'The wedding reception was held in a beautiful hall by the lake.',
                correctAnswer: 'reception',
                level: 'B2'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What did the man use to say hello? A friendly [1].',
                audioUrl: 'He waved his hand in a friendly gesture to say hello from across the street.',
                correctAnswer: 'gesture',
                level: 'B2'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What should you study before traveling? Professional [1].',
                audioUrl: 'Business travelers should study the local etiquette to avoid mistakes.',
                correctAnswer: 'etiquette',
                level: 'C1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'How was the man’s welcome described? Very [1].',
                audioUrl: 'We received a cordial welcome from the host as soon as we arrived.',
                correctAnswer: 'cordial',
                level: 'C1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What did the boss fail to do? [1] the employee.',
                audioUrl: 'It is rude to walk past someone and not acknowledge their presence.',
                correctAnswer: 'acknowledge',
                level: 'C1'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What is the formal term for a greeting? A [1].',
                audioUrl: 'The letter began with a formal salutation to the Director.',
                correctAnswer: 'salutation',
                level: 'C2'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'How is the new neighbor described? [1] and kind.',
                audioUrl: 'The new neighbor is very amiable and always helps everyone.',
                correctAnswer: 'amiable',
                level: 'C2'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What kind of personality does the host have? An [1] one.',
                audioUrl: 'His affable nature makes it very easy for him to make new friends.',
                correctAnswer: 'affable',
                level: 'C2'
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What should you say when someone says "Thank you"? [1].',
                audioUrl: 'You are welcome! I am happy that I could help you with your bag.',
                correctAnswer: 'welcome',
                level: 'A1'
            }
        ]
        const exercises = rawExercises.map(ex => ({
            ...ex,
            topicId: topic._id
        }));

        await Exercise.insertMany(exercises);
        console.log(`✅ Đã thêm thành công ${exercises.length} bài tập Listening (Fill in Blank) vào chủ đề "${topic.name}".`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err);
        process.exit(1);
    }
};

seed();
