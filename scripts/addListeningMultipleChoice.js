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

        // Dữ liệu mẫu (Listening - Multiple Choice)
        const rawExercises = [

            // 1. healthy (A1 - direct)
            // 21. stress (B1 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What feeling do many people have from work pressure?',
                audioUrl: 'Too much work creates a lot of stress and can make you feel tired all the time.',
                options: [{ text: 'Happiness', isCorrect: false }, { text: 'Stress', isCorrect: true }, { text: 'Relaxation', isCorrect: false }, { text: 'Energy', isCorrect: false }],
                correctAnswer: 'Stress', explanation: 'Căng thẳng từ áp lực → stress (căng thẳng).',
                level: 'B1'
            },
            // 22. gym (B1 - direct)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'Where does the speaker go to exercise?',
                audioUrl: 'I go to the gym three times a week.',
                options: [{ text: 'Park', isCorrect: false }, { text: 'Gym', isCorrect: true }, { text: 'Home', isCorrect: false }, { text: 'Office', isCorrect: false }],
                correctAnswer: 'Gym', explanation: 'Người nói dùng "gym" (phòng tập gym).',
                level: 'B1'
            },
            // 23. yoga (B1 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What relaxing exercise does the speaker practice?',
                audioUrl: 'Yoga helps me relax and improve my flexibility after a stressful day.',
                options: [{ text: 'Running fast', isCorrect: false }, { text: 'Yoga', isCorrect: true }, { text: 'Weight lifting', isCorrect: false }, { text: 'Swimming', isCorrect: false }],
                correctAnswer: 'Yoga', explanation: 'Bài tập thư giãn, cải thiện sự linh hoạt → yoga (yoga).',
                level: 'B1'
            },
            // 24. habit (B1 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What repeated behavior affects our health?',
                audioUrl: 'Good habits like drinking water and exercising every day make a big difference.',
                options: [{ text: 'One-time action', isCorrect: false }, { text: 'Habit', isCorrect: true }, { text: 'Accident', isCorrect: false }, { text: 'Dream', isCorrect: false }],
                correctAnswer: 'Habit', explanation: 'Thói quen lặp lại → habit (thói quen).',
                level: 'B1'
            },
            // 25. energy (B1 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What do we get from good food and sleep?',
                audioUrl: 'Eating healthy gives me more energy for the whole day.',
                options: [{ text: 'Tiredness', isCorrect: false }, { text: 'Energy', isCorrect: true }, { text: 'Sleepiness', isCorrect: false }, { text: 'Stress', isCorrect: false }],
                correctAnswer: 'Energy', explanation: 'Năng lượng từ lối sống lành mạnh → energy (năng lượng).',
                level: 'B1'
            },
            // 26. obesity (B2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What health problem comes from too much junk food and no exercise?',
                audioUrl: 'Obesity is becoming a big problem because people eat too much unhealthy food and don’t move enough.',
                options: [{ text: 'Being too thin', isCorrect: false }, { text: 'Obesity', isCorrect: true }, { text: 'High energy', isCorrect: false }, { text: 'Strong muscles', isCorrect: false }],
                correctAnswer: 'Obesity', explanation: 'Béo phì do lối sống → obesity (béo phì).',
                level: 'B2'
            },
            // 27. nutrition (B2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What science studies food and its effect on the body?',
                audioUrl: 'Good nutrition is key to having strong bones, healthy skin, and high energy.',
                options: [{ text: 'Weather', isCorrect: false }, { text: 'Nutrition', isCorrect: true }, { text: 'Maths', isCorrect: false }, { text: 'History', isCorrect: false }],
                correctAnswer: 'Nutrition', explanation: 'Dinh dưỡng ảnh hưởng sức khỏe → nutrition (dinh dưỡng).',
                level: 'B2'
            },
            // 28. addiction (B2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What serious problem can happen with too much sugar or phone use?',
                audioUrl: 'Many young people have a sugar addiction and can’t stop eating sweets.',
                options: [{ text: 'Dislike', isCorrect: false }, { text: 'Addiction', isCorrect: true }, { text: 'Energy boost', isCorrect: false }, { text: 'Relaxation', isCorrect: false }],
                correctAnswer: 'Addiction', explanation: 'Nghiện đường hoặc đồ ăn → addiction (nghiện).',
                level: 'B2'
            },
            // 29. meditation (B2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What quiet practice helps reduce stress?',
                audioUrl: 'I do meditation every morning to calm my mind and reduce stress.',
                options: [{ text: 'Running fast', isCorrect: false }, { text: 'Meditation', isCorrect: true }, { text: 'Eating junk', isCorrect: false }, { text: 'Working overtime', isCorrect: false }],
                correctAnswer: 'Meditation', explanation: 'Thiền giúp giảm căng thẳng → meditation (thiền).',
                level: 'B2'
            },
            // 30. immune system (B2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What protects our body from getting sick?',
                audioUrl: 'Eating fruits rich in vitamin C helps strengthen your immune system.',
                options: [{ text: 'Weakness', isCorrect: false }, { text: 'Immune system', isCorrect: true }, { text: 'Stress', isCorrect: false }, { text: 'Injury', isCorrect: false }],
                correctAnswer: 'Immune system', explanation: 'Hệ miễn dịch chống bệnh → immune system (hệ miễn dịch).',
                level: 'B2'
            },
            // 31. sedentary (B2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What lifestyle causes many health problems today?',
                audioUrl: 'A sedentary lifestyle with too much sitting and no exercise leads to weight gain and heart problems.',
                options: [{ text: 'Very active', isCorrect: false }, { text: 'Sedentary', isCorrect: true }, { text: 'Running daily', isCorrect: false }, { text: 'Gym every day', isCorrect: false }],
                correctAnswer: 'Sedentary', explanation: 'Ít vận động, ngồi nhiều → sedentary (ít vận động).',
                level: 'B2'
            },
            // 32. wellness (B2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What is the overall state of good health called?',
                audioUrl: 'Wellness includes physical health, mental peace, and emotional balance.',
                options: [{ text: 'Illness', isCorrect: false }, { text: 'Wellness', isCorrect: true }, { text: 'Stress', isCorrect: false }, { text: 'Injury', isCorrect: false }],
                correctAnswer: 'Wellness', explanation: 'Sức khỏe toàn diện (thể chất + tinh thần) → wellness (sức khỏe toàn diện).',
                level: 'B2'
            },
            // 33. metabolism (B2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What process in the body turns food into energy?',
                audioUrl: 'A fast metabolism helps burn calories quickly, while a slow one can lead to weight gain.',
                options: [{ text: 'Digestion only', isCorrect: false }, { text: 'Metabolism', isCorrect: true }, { text: 'Breathing', isCorrect: false }, { text: 'Sleeping', isCorrect: false }],
                correctAnswer: 'Metabolism', explanation: 'Quá trình trao đổi chất → metabolism (sự trao đổi chất).',
                level: 'B2'
            },
            // 34. longevity (C1 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What is the result of a healthy lifestyle over many years?',
                audioUrl: 'People in this region have high longevity thanks to their diet, exercise, and low stress.',
                options: [{ text: 'Short life', isCorrect: false }, { text: 'Longevity', isCorrect: true }, { text: 'Early illness', isCorrect: false }, { text: 'Obesity', isCorrect: false }],
                correctAnswer: 'Longevity', explanation: 'Sự sống lâu, trường thọ → longevity (sự trường thọ).',
                level: 'C1'
            },
            // 35. stamina (C1 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What ability helps you keep going during long exercise?',
                audioUrl: 'After months of training, her stamina improved so she could run a marathon without stopping.',
                options: [{ text: 'Weakness', isCorrect: false }, { text: 'Stamina', isCorrect: true }, { text: 'Quick tiredness', isCorrect: false }, { text: 'Short breath', isCorrect: false }],
                correctAnswer: 'Stamina', explanation: 'Sức bền trong hoạt động dài → stamina (sức bền).',
                level: 'C1'
            },
            // 36. therapeutic (C1 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What effect does yoga have on mental health?',
                audioUrl: 'Yoga has therapeutic benefits for reducing anxiety and improving mood.',
                options: [{ text: 'Harmful', isCorrect: false }, { text: 'Therapeutic', isCorrect: true }, { text: 'No effect', isCorrect: false }, { text: 'Dangerous', isCorrect: false }],
                correctAnswer: 'Therapeutic', explanation: 'Có tính trị liệu, hỗ trợ chữa lành → therapeutic (có tính trị liệu).',
                level: 'C1'
            },
            // 37. detrimental (C2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What kind of effect does smoking have on health?',
                audioUrl: 'Smoking is extremely detrimental to your lungs, heart, and overall life expectancy.',
                options: [{ text: 'Beneficial', isCorrect: false }, { text: 'Detrimental', isCorrect: true }, { text: 'Neutral', isCorrect: false }, { text: 'Helpful', isCorrect: false }],
                correctAnswer: 'Detrimental', explanation: 'Có hại, bất lợi nghiêm trọng → detrimental (có hại/bất lợi).',
                level: 'C2'
            },
            // 38. rejuvenate (C2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What does a good holiday do to your energy?',
                audioUrl: 'A week by the sea can rejuvenate your body and mind, making you feel young and full of energy again.',
                options: [{ text: 'Tire you more', isCorrect: false }, { text: 'Rejuvenate', isCorrect: true }, { text: 'Make you older', isCorrect: false }, { text: 'Weaken you', isCorrect: false }],
                correctAnswer: 'Rejuvenate', explanation: 'Làm trẻ hóa, hồi phục sức sống → rejuvenate (làm trẻ hóa/hồi phục sức sống).',
                level: 'C2'
            },
            // 39. equilibrium (C2 - inference)
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What state does the body try to maintain for good health?',
                audioUrl: 'The body always seeks equilibrium – a perfect balance of hormones, temperature, and energy.',
                options: [{ text: 'Imbalance', isCorrect: false }, { text: 'Equilibrium', isCorrect: true }, { text: 'Chaos', isCorrect: false }, { text: 'Extreme', isCorrect: false }],
                correctAnswer: 'Equilibrium', explanation: 'Trạng thái cân bằng trong cơ thể → equilibrium (trạng thái cân bằng).',
                level: 'C2'
            }
        ];
        // Gán topicId vào từng bài tập
        const exercises = rawExercises.map(ex => ({
            ...ex,
            topicId: topic._id
        }));

        await Exercise.insertMany(exercises);
        console.log(`✅ Đã thêm thành công ${exercises.length} bài tập Listening (Multiple Choice) vào chủ đề "${topic.name}".`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err);
        process.exit(1);
    }
};

seed();
