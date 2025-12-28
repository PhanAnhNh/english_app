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

        const rawExercises = [
            // 1. hello (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'When you meet someone for the first time, you say ________.',
                options: [{ text: 'Goodbye', isCorrect: false }, { text: 'Hello', isCorrect: true }, { text: 'Sorry', isCorrect: false }, { text: 'Please', isCorrect: false }],
                correctAnswer: 'Hello', explanation: 'Khi gặp ai đó lần đầu, bạn nói "xin chào".',
                level: 'A1'
            },
            // 2. hi (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'A friendly and short way to say hello to friends is ________.',
                options: [{ text: 'Goodbye', isCorrect: false }, { text: 'Hi', isCorrect: true }, { text: 'Thank you', isCorrect: false }, { text: 'Please', isCorrect: false }],
                correctAnswer: 'Hi', explanation: 'Cách chào thân mật và ngắn gọn với bạn bè là "hi" (chào).',
                level: 'A1'
            },
            // 3. good morning (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'You say ________ when you meet someone in the morning.',
                options: [{ text: 'Good night', isCorrect: false }, { text: 'Good morning', isCorrect: true }, { text: 'Good afternoon', isCorrect: false }, { text: 'Good evening', isCorrect: false }],
                correctAnswer: 'Good morning', explanation: 'Bạn nói "chào buổi sáng" khi gặp ai đó vào buổi sáng.',
                level: 'A1'
            },
            // 4. good afternoon (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'In the afternoon, people say ________ to greet each other.',
                options: [{ text: 'Good morning', isCorrect: false }, { text: 'Good afternoon', isCorrect: true }, { text: 'Good night', isCorrect: false }, { text: 'Hello', isCorrect: false }],
                correctAnswer: 'Good afternoon', explanation: 'Vào buổi chiều, mọi người nói "chào buổi chiều" để chào hỏi.',
                level: 'A1'
            },
            // 5. good evening (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'When it gets dark, you can say ________ to someone.',
                options: [{ text: 'Good morning', isCorrect: false }, { text: 'Good evening', isCorrect: true }, { text: 'Good afternoon', isCorrect: false }, { text: 'Good night', isCorrect: false }],
                correctAnswer: 'Good evening', explanation: 'Khi trời tối, bạn có thể nói "chào buổi tối" với ai đó.',
                level: 'A1'
            },
            // 6. good night (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Before going to bed, you say ________ to your family.',
                options: [{ text: 'Good morning', isCorrect: false }, { text: 'Good night', isCorrect: true }, { text: 'Hello', isCorrect: false }, { text: 'Thank you', isCorrect: false }],
                correctAnswer: 'Good night', explanation: 'Trước khi đi ngủ, bạn nói "chúc ngủ ngon" với gia đình.',
                level: 'A1'
            },
            // 7. goodbye (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'When you leave a place, you wave and say ________.',
                options: [{ text: 'Hello', isCorrect: false }, { text: 'Goodbye', isCorrect: true }, { text: 'Please', isCorrect: false }, { text: 'Sorry', isCorrect: false }],
                correctAnswer: 'Goodbye', explanation: 'Khi rời khỏi một nơi, bạn vẫy tay và nói "tạm biệt".',
                level: 'A1'
            },
            // 8. bye (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'A short and friendly way to say goodbye is ________.',
                options: [{ text: 'Hello', isCorrect: false }, { text: 'Bye', isCorrect: true }, { text: 'Good morning', isCorrect: false }, { text: 'Thank you', isCorrect: false }],
                correctAnswer: 'Bye', explanation: 'Cách nói tạm biệt ngắn gọn và thân mật là "bye".',
                level: 'A1'
            },
            // 9. fine (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'When someone asks “How are you?”, you can answer “I’m ________.”',
                options: [{ text: 'Sad', isCorrect: false }, { text: 'Fine', isCorrect: true }, { text: 'Tired', isCorrect: false }, { text: 'Hungry', isCorrect: false }],
                correctAnswer: 'Fine', explanation: 'Khi ai đó hỏi “Bạn khỏe không?”, bạn có thể trả lời “Tôi khỏe” (I’m fine).',
                level: 'A1'
            },
            // 10. thank you (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'When someone helps you, you say ________.',
                options: [{ text: 'Sorry', isCorrect: false }, { text: 'Thank you', isCorrect: true }, { text: 'Goodbye', isCorrect: false }, { text: 'Hello', isCorrect: false }],
                correctAnswer: 'Thank you', explanation: 'Khi ai đó giúp bạn, bạn nói “cảm ơn”.',
                level: 'A1'
            },
            // 11. thanks (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'A short and friendly way to say thank you is ________.',
                options: [{ text: 'Please', isCorrect: false }, { text: 'Thanks', isCorrect: true }, { text: 'Sorry', isCorrect: false }, { text: 'Bye', isCorrect: false }],
                correctAnswer: 'Thanks', explanation: 'Cách nói cảm ơn ngắn gọn và thân mật là “thanks”.',
                level: 'A1'
            },
            // 12. welcome (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'When someone says thank you, you can reply “You’re ________.”',
                options: [{ text: 'Sorry', isCorrect: false }, { text: 'Welcome', isCorrect: true }, { text: 'Goodbye', isCorrect: false }, { text: 'Hello', isCorrect: false }],
                correctAnswer: 'Welcome', explanation: 'Khi ai đó nói cảm ơn, bạn có thể trả lời “Không có chi” (You’re welcome).',
                level: 'A1'
            },
            // 13. meet (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Nice to ________ you!',
                options: [{ text: 'Eat', isCorrect: false }, { text: 'Meet', isCorrect: true }, { text: 'Sleep', isCorrect: false }, { text: 'Run', isCorrect: false }],
                correctAnswer: 'Meet', explanation: 'Rất vui được gặp bạn!',
                level: 'A1'
            },
            // 14. name (A1 - direct)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'What is your ________? My name is Anna.',
                options: [{ text: 'Age', isCorrect: false }, { text: 'Name', isCorrect: true }, { text: 'Job', isCorrect: false }, { text: 'Phone', isCorrect: false }],
                correctAnswer: 'Name', explanation: 'Tên bạn là gì? Tên tôi là Anna.',
                level: 'A1'
            },
            // 15. introduce (A2 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Let me ________ myself. My name is Minh.',
                options: [{ text: 'Eat', isCorrect: false }, { text: 'Introduce', isCorrect: true }, { text: 'Sleep', isCorrect: false }, { text: 'Run', isCorrect: false }],
                correctAnswer: 'Introduce', explanation: 'Để tôi giới thiệu bản thân. Tên tôi là Minh.',
                level: 'A2'
            },
            // 16. visitor (A2 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'We have a special ________ from Hanoi today.',
                options: [{ text: 'Teacher', isCorrect: false }, { text: 'Visitor', isCorrect: true }, { text: 'Student', isCorrect: false }, { text: 'Doctor', isCorrect: false }],
                correctAnswer: 'Visitor', explanation: 'Hôm nay chúng tôi có một vị khách đặc biệt từ Hà Nội.',
                level: 'A2'
            },
            // 17. invite (A2 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'I would like to ________ you to my birthday party.',
                options: [{ text: 'Say no', isCorrect: false }, { text: 'Invite', isCorrect: true }, { text: 'Forget', isCorrect: false }, { text: 'Ignore', isCorrect: false }],
                correctAnswer: 'Invite', explanation: 'Tôi muốn mời bạn đến dự sinh nhật của tôi.',
                level: 'A2'
            },
            // 18. greet (B1 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'In many cultures, people ________ each other with a handshake or a smile.',
                options: [{ text: 'Fight', isCorrect: false }, { text: 'Greet', isCorrect: true }, { text: 'Sleep', isCorrect: false }, { text: 'Eat', isCorrect: false }],
                correctAnswer: 'Greet', explanation: 'Ở nhiều nền văn hóa, mọi người chào hỏi nhau bằng cái bắt tay hoặc nụ cười.',
                level: 'B1'
            },
            // 19. conversation (B1 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'We had a very interesting ________ about travel and food.',
                options: [{ text: 'Game', isCorrect: false }, { text: 'Conversation', isCorrect: true }, { text: 'Meal', isCorrect: false }, { text: 'Sleep', isCorrect: false }],
                correctAnswer: 'Conversation', explanation: 'Chúng tôi đã có một cuộc trò chuyện rất thú vị về du lịch và ẩm thực.',
                level: 'B1'
            },
            // 20. polite (B1 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'It is important to be ________ when you talk to older people.',
                options: [{ text: 'Rude', isCorrect: false }, { text: 'Polite', isCorrect: true }, { text: 'Loud', isCorrect: false }, { text: 'Fast', isCorrect: false }],
                correctAnswer: 'Polite', explanation: 'Rất quan trọng khi nói chuyện với người lớn tuổi phải lịch sự.',
                level: 'B1'
            },
            // 21. reception (B2 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'The hotel gave us a very warm ________ when we arrived.',
                options: [{ text: 'Cold welcome', isCorrect: false }, { text: 'Reception', isCorrect: true }, { text: 'Problem', isCorrect: false }, { text: 'Bill', isCorrect: false }],
                correctAnswer: 'Reception', explanation: 'Khách sạn tiếp đón chúng tôi rất nồng nhiệt khi đến.',
                level: 'B2'
            },
            // 22. formal (B2 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'In a job interview, you should use ________ language.',
                options: [{ text: 'Slang', isCorrect: false }, { text: 'Formal', isCorrect: true }, { text: 'Funny', isCorrect: false }, { text: 'Loud', isCorrect: false }],
                correctAnswer: 'Formal', explanation: 'Trong buổi phỏng vấn xin việc, bạn nên dùng ngôn ngữ trang trọng.',
                level: 'B2'
            },
            // 23. gesture (B2 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'A smile is a friendly ________ in most cultures.',
                options: [{ text: 'Word', isCorrect: false }, { text: 'Gesture', isCorrect: true }, { text: 'Song', isCorrect: false }, { text: 'Food', isCorrect: false }],
                correctAnswer: 'Gesture', explanation: 'Nụ cười là một cử chỉ thân thiện ở hầu hết các nền văn hóa.',
                level: 'B2'
            },
            // 24. etiquette (C1 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Good table ________ means you wait for everyone before starting to eat.',
                options: [{ text: 'Bad manners', isCorrect: false }, { text: 'Etiquette', isCorrect: true }, { text: 'Fast eating', isCorrect: false }, { text: 'No rules', isCorrect: false }],
                correctAnswer: 'Etiquette', explanation: 'Phép lịch sự bàn ăn yêu cầu chờ mọi người trước khi bắt đầu ăn.',
                level: 'C1'
            },
            // 25. cordial (C1 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'The host gave us a very ________ welcome with warm smiles and drinks.',
                options: [{ text: 'Cold', isCorrect: false }, { text: 'Cordial', isCorrect: true }, { text: 'Angry', isCorrect: false }, { text: 'Silent', isCorrect: false }],
                correctAnswer: 'Cordial', explanation: 'Chủ nhà tiếp đón chúng tôi rất thân ái với nụ cười ấm áp và đồ uống.',
                level: 'C1'
            },
            // 26. acknowledge (C1 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'When someone greets you, it is polite to ________ them with a smile.',
                options: [{ text: 'Ignore', isCorrect: false }, { text: 'Acknowledge', isCorrect: true }, { text: 'Run away', isCorrect: false }, { text: 'Shout', isCorrect: false }],
                correctAnswer: 'Acknowledge', explanation: 'Khi ai đó chào bạn, lịch sự là đáp lại bằng một nụ cười.',
                level: 'C1'
            },
            // 27. salutation (C2 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'In formal letters, people start with a polite ________ like “Dear Sir”.',
                options: [{ text: 'Complaint', isCorrect: false }, { text: 'Salutation', isCorrect: true }, { text: 'Joke', isCorrect: false }, { text: 'Question', isCorrect: false }],
                correctAnswer: 'Salutation', explanation: 'Trong thư trang trọng, người ta bắt đầu bằng lời chào lịch sự như “Kính gửi Quý ông”.',
                level: 'C2'
            },
            // 28. amiable (C2 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'She is always ________ and makes everyone feel comfortable.',
                options: [{ text: 'Rude', isCorrect: false }, { text: 'Amiable', isCorrect: true }, { text: 'Angry', isCorrect: false }, { text: 'Silent', isCorrect: false }],
                correctAnswer: 'Amiable', explanation: 'Cô ấy luôn tử tế và dễ mến, khiến mọi người cảm thấy thoải mái.',
                level: 'C2'
            },
            // 29. affable (C2 - inference)
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'The new manager is very ________ and easy to talk to.',
                options: [{ text: 'Cold', isCorrect: false }, { text: 'Affable', isCorrect: true }, { text: 'Strict', isCorrect: false }, { text: 'Shy', isCorrect: false }],
                correctAnswer: 'Affable', explanation: 'Vị quản lý mới rất lịch thiệp và dễ nói chuyện.',
                level: 'C2'
            }
        ];
        const exercises = rawExercises.map(ex => ({
            ...ex,
            topicId: topic._id
        }));

        await Exercise.insertMany(exercises);
        console.log(`✅ Đã thêm thành công ${exercises.length} bài tập Reading (Multiple Choice) vào chủ đề "${topic.name}".`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err);
        process.exit(1);
    }
};

seed();
