const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Topic = require('../src/model/Topic');
const Vocabulary = require('../src/model/Vocabulary');
const Exercise = require('../src/model/Exercise');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Create Topic
        const cultureTopic = await Topic.create({
            name: 'Culture',
            description: 'Explore traditions, customs, and social behaviors from around the world.',
            level: 'B1',
            imageUrl: 'https://img.freepik.com/free-vector/world-culture-concept-illustration_114360-10115.jpg',
            order: 11
        });

        console.log('✅ Created Topic: Culture (A2-B1)');

        const vocabItems = [
            { word: 'tradition', meaning: 'truyền thống', level: 'A2', topic: cultureTopic._id },
            { word: 'custom', meaning: 'phong tục', level: 'B1', topic: cultureTopic._id },
            { word: 'respect', meaning: 'tôn trọng', level: 'A2', topic: cultureTopic._id },
            { word: 'celebrate', meaning: 'ăn mừng/kỷ niệm', level: 'A2', topic: cultureTopic._id },
            { word: 'festival', meaning: 'lễ hội', level: 'A2', topic: cultureTopic._id },
            { word: 'etiquette', meaning: 'phép lịch sự', level: 'B1', topic: cultureTopic._id },
            { word: 'greeting', meaning: 'lời chào hỏi', level: 'A2', topic: cultureTopic._id },
            { word: 'heritage', meaning: 'di sản', level: 'B1', topic: cultureTopic._id },
            { word: 'diverse', meaning: 'đa dạng', level: 'B1', topic: cultureTopic._id },
            { word: 'values', meaning: 'giá trị đạo đức', level: 'B1', topic: cultureTopic._id },
            { word: 'costume', meaning: 'trang phục truyền thống', level: 'B1', topic: cultureTopic._id },
            { word: 'ceremony', meaning: 'nghi lễ', level: 'B1', topic: cultureTopic._id },
            { word: 'belief', meaning: 'niềm tin/tín ngưỡng', level: 'B1', topic: cultureTopic._id },
            { word: 'hospitality', meaning: 'sự hiếu khách', level: 'B1', topic: cultureTopic._id },
            { word: 'symbol', meaning: 'biểu tượng', level: 'A2', topic: cultureTopic._id },
            { word: 'generations', meaning: 'các thế hệ', level: 'B1', topic: cultureTopic._id }
        ];
        await Vocabulary.insertMany(vocabItems);
        console.log('✅ Created Vocabulary items (16 từ cơ bản A1)');

        // 3. Create Exercises (đủ 40 bài tập - câu hỏi tự nhiên hơn, gần gũi như nói chuyện hàng ngày)
        const exercises = [
            // ==================== LISTENING - MULTIPLE CHOICE (15 bài) ====================
            // ==================== LISTENING - MULTIPLE CHOICE (15 bài - Suy luận) ====================
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is the speaker demonstrating through their action?',
                audioUrl: 'When the teacher entered the room, all the students stopped talking and stood up immediately to greet her.',
                options: [
                    { text: 'Respect', isCorrect: true },
                    { text: 'Hospitality', isCorrect: false },
                    { text: 'Tradition', isCorrect: false },
                    { text: 'Festival', isCorrect: false }
                ],
                correctAnswer: 'Respect',
                explanation: 'Hành động đứng dậy khi giáo viên vào lớp là biểu hiện của sự tôn trọng (Respect).',
                level: 'A2',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What kind of event is the speaker attending?',
                audioUrl: 'There are colorful lights everywhere, people are dancing in the streets, and the fireworks are about to start in ten minutes!',
                options: [
                    { text: 'A funeral', isCorrect: false },
                    { text: 'A festival', isCorrect: true },
                    { text: 'A business meeting', isCorrect: false },
                    { text: 'A library', isCorrect: false }
                ],
                correctAnswer: 'A festival',
                explanation: 'Ánh sáng, nhảy múa và pháo hoa là đặc trưng của một lễ hội (Festival).',
                level: 'A2',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is the speaker talking about?',
                audioUrl: 'In this country, it is very common to remove your shoes before entering someone\'s house. Almost everyone does it.',
                options: [
                    { text: 'A local custom', isCorrect: true },
                    { text: 'A national costume', isCorrect: false },
                    { text: 'A modern technology', isCorrect: false },
                    { text: 'A natural disaster', isCorrect: false }
                ],
                correctAnswer: 'A local custom',
                explanation: 'Việc cởi giày trước khi vào nhà là một phong tục địa phương (Custom).',
                level: 'B1',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'How does the speaker feel about the local people?',
                audioUrl: 'We got lost in the village, but a family invited us in, gave us warm tea, and even offered us a place to sleep.',
                options: [
                    { text: 'They are rude', isCorrect: false },
                    { text: 'They are very diverse', isCorrect: false },
                    { text: 'They show great hospitality', isCorrect: true },
                    { text: 'They are afraid of strangers', isCorrect: false }
                ],
                correctAnswer: 'They show great hospitality',
                explanation: 'Mời trà và cho người lạ ngủ nhờ thể hiện sự hiếu khách (Hospitality).',
                level: 'B1',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is the object being described?',
                audioUrl: 'This white bird is often seen in paintings and posters to represent peace and harmony between nations.',
                options: [
                    { text: 'A symbol', isCorrect: true },
                    { text: 'A costume', isCorrect: false },
                    { text: 'A greeting', isCorrect: false },
                    { text: 'A value', isCorrect: false }
                ],
                correctAnswer: 'A symbol',
                explanation: 'Vật đại diện cho một ý tưởng (hòa bình) là một biểu tượng (Symbol).',
                level: 'A2',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is the speaker teaching?',
                audioUrl: 'When you are at a formal dinner, remember to keep your phone away and wait for the host to start eating first.',
                options: [
                    { text: 'Cooking skills', isCorrect: false },
                    { text: 'Table etiquette', isCorrect: true },
                    { text: 'Historical heritage', isCorrect: false },
                    { text: 'Religious beliefs', isCorrect: false }
                ],
                correctAnswer: 'Table etiquette',
                explanation: 'Quy tắc dùng bữa lịch sự gọi là phép lịch sự (Etiquette).',
                level: 'B1',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'Who has lived in this house?',
                audioUrl: 'My great-grandfather built this house, then my father lived here, and now I am raising my own children in it.',
                options: [
                    { text: 'Only one person', isCorrect: false },
                    { text: 'Many different families', isCorrect: false },
                    { text: 'Three generations', isCorrect: true },
                    { text: 'Students from abroad', isCorrect: false }
                ],
                correctAnswer: 'Three generations',
                explanation: 'Cụ, bố và con cái cùng sống trong một ngôi nhà là các thế hệ (Generations).',
                level: 'B1',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What did the performers wear?',
                audioUrl: 'The dancers looked amazing in their handmade silk dresses and gold hats that their ancestors used to wear.',
                options: [
                    { text: 'Modern uniforms', isCorrect: false },
                    { text: 'Traditional costumes', isCorrect: true },
                    { text: 'Casual clothes', isCorrect: false },
                    { text: 'Sportswear', isCorrect: false }
                ],
                correctAnswer: 'Traditional costumes',
                explanation: 'Quần áo truyền thống của tổ tiên để lại là trang phục dân tộc (Costume).',
                level: 'A2',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is special about the neighborhood?',
                audioUrl: 'On this street, you can hear five different languages and find food from every continent in the world.',
                options: [
                    { text: 'It is very quiet', isCorrect: false },
                    { text: 'It is culturally diverse', isCorrect: true },
                    { text: 'It is very old', isCorrect: false },
                    { text: 'It is dangerous', isCorrect: false }
                ],
                correctAnswer: 'It is culturally diverse',
                explanation: 'Nhiều ngôn ngữ và đồ ăn từ khắp nơi cho thấy sự đa dạng (Diverse).',
                level: 'B1',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is the family doing?',
                audioUrl: 'Today is my grandparents\' 50th wedding anniversary. We have a huge cake and all our relatives are here.',
                options: [
                    { text: 'They celebrate a milestone', isCorrect: true },
                    { text: 'They study heritage', isCorrect: false },
                    { text: 'They change a custom', isCorrect: false },
                    { text: 'They learn a greeting', isCorrect: false }
                ],
                correctAnswer: 'They celebrate a milestone',
                explanation: 'Tổ chức tiệc kỷ niệm là hoạt động ăn mừng (Celebrate).',
                level: 'A2',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What happened when the two leaders met?',
                audioUrl: 'As soon as they saw each other, they smiled, shook hands, and said "It is an honor to meet you".',
                options: [
                    { text: 'A greeting', isCorrect: true },
                    { text: 'A ceremony', isCorrect: false },
                    { text: 'A belief', isCorrect: false },
                    { text: 'A tradition', isCorrect: false }
                ],
                correctAnswer: 'A greeting',
                explanation: 'Bắt tay và nói lời chào là hành động chào hỏi (Greeting).',
                level: 'A2',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What are the tourists visiting?',
                audioUrl: 'We are walking through an ancient temple built 1,000 years ago. It is protected by the government as a treasure.',
                options: [
                    { text: 'A modern mall', isCorrect: false },
                    { text: 'A cultural heritage site', isCorrect: true },
                    { text: 'A new factory', isCorrect: false },
                    { text: 'A movie theater', isCorrect: false }
                ],
                correctAnswer: 'A cultural heritage site',
                explanation: 'Đền cổ được bảo vệ là di sản văn hóa (Heritage).',
                level: 'B1',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is the speaker describing?',
                audioUrl: 'Many people in this village think that if a black cat crosses your path, you will have a bad day.',
                options: [
                    { text: 'A scientific fact', isCorrect: false },
                    { text: 'A superstitious belief', isCorrect: true },
                    { text: 'A medical etiquette', isCorrect: false },
                    { text: 'A greeting', isCorrect: false }
                ],
                correctAnswer: 'A superstitious belief',
                explanation: 'Quan niệm về điềm báo là một niềm tin/tín ngưỡng (Belief).',
                level: 'B1',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What event is taking place?',
                audioUrl: 'The couple is exchanging rings in front of their families and the music is playing very softly.',
                options: [
                    { text: 'A wedding ceremony', isCorrect: true },
                    { text: 'A sports competition', isCorrect: false },
                    { text: 'A birthday party', isCorrect: false },
                    { text: 'A school lesson', isCorrect: false }
                ],
                correctAnswer: 'A wedding ceremony',
                explanation: 'Trao nhẫn là một phần của nghi lễ (Ceremony).',
                level: 'B1',
                topicId: cultureTopic._id
            },
            {
                skill: 'listening',
                type: 'multiple_choice',
                questionText: 'What is the speaker most likely talking about?',
                audioUrl: 'Every year, we pass this secret recipe from our ancestors down to the younger children in the family.',
                options: [
                    { text: 'Tradition', isCorrect: true },
                    { text: 'Hospitality', isCorrect: false },
                    { text: 'Etiquette', isCorrect: false },
                    { text: 'Symbol', isCorrect: false }
                ],
                correctAnswer: 'Tradition',
                explanation: 'Việc truyền lại bí quyết từ tổ tiên cho đời sau là một truyền thống (Tradition).',
                level: 'A2',
                topicId: cultureTopic._id
            },

            // ==================== READING - MULTIPLE CHOICE (15 bài) ====================
            // ==================== READING - MULTIPLE CHOICE (15 bài) ====================
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: `Read the text: "In Japan, it is common to bow when meeting someone. The deeper the bow, the more respect you show to the other person."
What does bowing represent in Japanese culture?`,
                options: [
                    { text: 'A way to show respect', isCorrect: true },
                    { text: 'A type of festival', isCorrect: false },
                    { text: 'A traditional costume', isCorrect: false },
                    { text: 'A medical ceremony', isCorrect: false }
                ],
                correctAnswer: 'A way to show respect',
                explanation: 'Cúi chào là cách thể hiện sự tôn trọng (Respect).',
                level: 'A2', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: `Read the text: "Mexico's Day of the Dead is a time when families gather to remember their ancestors. They build altars and share traditional food to honor those who passed away."
This event is best described as a:`,
                options: [
                    { text: 'Festival', isCorrect: true },
                    { text: 'Greeting', isCorrect: false },
                    { text: 'Symbol', isCorrect: false },
                    { text: 'Etiquette', isCorrect: false }
                ],
                correctAnswer: 'Festival',
                explanation: 'Sự kiện tụ họp, có đồ ăn truyền thống và kỷ niệm là một lễ hội (Festival).',
                level: 'A2', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Which word describes a city where you can find people from many different backgrounds, religions, and countries?',
                options: [
                    { text: 'Diverse', isCorrect: true },
                    { text: 'Traditional', isCorrect: false },
                    { text: 'Hospitality', isCorrect: false },
                    { text: 'Ceremony', isCorrect: false }
                ],
                correctAnswer: 'Diverse',
                explanation: 'Đa dạng (Diverse) dùng để chỉ sự pha trộn nhiều nền văn hóa.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: `Read the text: "In many Middle Eastern countries, it is a _______ to offer tea to any guest who enters your home or shop. Refusing the tea can be seen as impolite."
Choose the best word to fill the blank:`,
                options: [
                    { text: 'Custom', isCorrect: true },
                    { text: 'Costume', isCorrect: false },
                    { text: 'Symbol', isCorrect: false },
                    { text: 'Heritage', isCorrect: false }
                ],
                correctAnswer: 'Custom',
                explanation: 'Mời trà khách là một phong tục (Custom) phổ biến.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Read the text: "The Sari is a long piece of colorful cloth draped around the body. It has been worn by women in India for thousands of years." \n The Sari is an example of a:',
                options: [
                    { text: 'Traditional costume', isCorrect: true },
                    { text: 'Modern etiquette', isCorrect: false },
                    { text: 'Greeting ceremony', isCorrect: false },
                    { text: 'Religious belief', isCorrect: false }
                ],
                correctAnswer: 'Traditional costume',
                explanation: 'Sari là trang phục truyền thống (Costume) của Ấn Độ.',
                level: 'A2', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'What is "etiquette"?',
                options: [
                    { text: 'The set of rules for polite behavior', isCorrect: true },
                    { text: 'A type of old building', isCorrect: false },
                    { text: 'A special holiday', isCorrect: false },
                    { text: 'A family history', isCorrect: false }
                ],
                correctAnswer: 'The set of rules for polite behavior',
                explanation: 'Etiquette là các quy tắc ứng xử lịch sự.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Read the text: "The Eiffel Tower is not just a building; it represents the spirit and history of France." \n In this context, the Eiffel Tower is a ________ of France.',
                options: [
                    { text: 'Symbol', isCorrect: true },
                    { text: 'Custom', isCorrect: false },
                    { text: 'Value', isCorrect: false },
                    { text: 'Generation', isCorrect: false }
                ],
                correctAnswer: 'Symbol',
                explanation: 'Vật đại diện cho một quốc gia/tinh thần là biểu tượng (Symbol).',
                level: 'A2', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Read the text: "In Bedouin culture, guests are treated with extreme kindness. They are often given the best food and a safe place to rest for three days." \n This behavior shows great:',
                options: [
                    { text: 'Hospitality', isCorrect: true },
                    { text: 'Heritage', isCorrect: false },
                    { text: 'Ceremony', isCorrect: false },
                    { text: 'Diverse', isCorrect: false }
                ],
                correctAnswer: 'Hospitality',
                explanation: 'Sự tử tế nồng hậu với khách là hiếu khách (Hospitality).',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Old buildings, monuments, and traditional dances that are protected for the future are part of a country\'s:',
                options: [
                    { text: 'Heritage', isCorrect: true },
                    { text: 'Values', isCorrect: false },
                    { text: 'Greetings', isCorrect: false },
                    { text: 'Etiquette', isCorrect: false }
                ],
                correctAnswer: 'Heritage',
                explanation: 'Các công trình và giá trị từ quá khứ được bảo tồn là di sản (Heritage).',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'A wedding is a formal ________ where two people are legally and socially joined together.',
                options: [
                    { text: 'Ceremony', isCorrect: true },
                    { text: 'Belief', isCorrect: false },
                    { text: 'Symbol', isCorrect: false },
                    { text: 'Diverse', isCorrect: false }
                ],
                correctAnswer: 'Ceremony',
                explanation: 'Đám cưới là một nghi lễ (Ceremony).',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Read the text: "My grandfather taught me to always be honest and work hard. These are the things my family thinks are most important." \n These important ideas are called:',
                options: [
                    { text: 'Values', isCorrect: true },
                    { text: 'Costumes', isCorrect: false },
                    { text: 'Festivals', isCorrect: false },
                    { text: 'Heritages', isCorrect: false }
                ],
                correctAnswer: 'Values',
                explanation: 'Những quan niệm sống quan trọng là giá trị đạo đức (Values).',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Read the text: "In some cultures, people believe that hanging a dreamcatcher above the bed will protect them from bad dreams." \n This is an example of a cultural:',
                options: [
                    { text: 'Belief', isCorrect: true },
                    { text: 'Custom', isCorrect: false },
                    { text: 'Etiquette', isCorrect: false },
                    { text: 'Greeting', isCorrect: false }
                ],
                correctAnswer: 'Belief',
                explanation: 'Tin vào tác dụng của vật phẩm tâm linh là một niềm tin (Belief).',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'When you say "Hello" or "Namaste" to someone, you are giving them a:',
                options: [
                    { text: 'Greeting', isCorrect: true },
                    { text: 'Tradition', isCorrect: false },
                    { text: 'Ceremony', isCorrect: false },
                    { text: 'Festival', isCorrect: false }
                ],
                correctAnswer: 'Greeting',
                explanation: 'Chào hỏi là Greeting.',
                level: 'A2', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Read the text: "Our town has held the same parade on the first of May for over 300 years. It has never changed." \n This event is a long-standing:',
                options: [
                    { text: 'Tradition', isCorrect: true },
                    { text: 'Etiquette', isCorrect: false },
                    { text: 'Symbol', isCorrect: false },
                    { text: 'Value', isCorrect: false }
                ],
                correctAnswer: 'Tradition',
                explanation: 'Sự kiện lặp lại suốt 300 năm là truyền thống (Tradition).',
                level: 'A2', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'In a family, the grandparents, the parents, and the children represent three different:',
                options: [
                    { text: 'Generations', isCorrect: true },
                    { text: 'Costumes', isCorrect: false },
                    { text: 'Festivals', isCorrect: false },
                    { text: 'Symbols', isCorrect: false }
                ],
                correctAnswer: 'Generations',
                explanation: 'Ông bà, cha mẹ, con cái là các thế hệ (Generations).',
                level: 'B1', topicId: cultureTopic._id
            },

            // ==================== CLOZE TEST (5 bài) ====================
            // ==================== READING - CLOZE TEST (5 bài - Có list từ xáo trộn) ====================
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [generations, celebrate, tradition]. \n Our family has a long [1] of cooking together. We [2] every holiday this way, passing recipes through many [3].',
                correctAnswer: 'tradition/celebrate/generations',
                options: [], explanation: 'Truyền thống -> Ăn mừng -> Các thế hệ.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [respect, diverse, values]. \n In a [1] society, people have different beliefs. However, we should all share the same [2] of showing [3] to everyone.',
                correctAnswer: 'diverse/values/respect',
                options: [], explanation: 'Đa dạng -> Giá trị -> Tôn trọng.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [costume, festival, custom]. \n During the spring [1], it is a local [2] to wear a colorful [3] made of silk.',
                correctAnswer: 'festival/custom/costume',
                options: [], explanation: 'Lễ hội -> Phong tục -> Trang phục.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [greeting, hospitality, etiquette]. \n Good [1] starts with a warm [2]. In our culture, showing [3] means making guests feel at home.',
                correctAnswer: 'etiquette/greeting/hospitality',
                options: [], explanation: 'Phép lịch sự -> Lời chào -> Sự hiếu khách.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [belief, heritage, symbol]. \n This temple is a [1] of our national [2]. It represents our deep [3] in peace.',
                correctAnswer: 'symbol/heritage/belief',
                options: [], explanation: 'Biểu tượng -> Di sản -> Niềm tin.',
                level: 'B1', topicId: cultureTopic._id
            },

            // ==================== READING - FILL IN BLANK (5 bài) ====================
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'The formal rules for polite behavior in a particular group or situation are called [1].',
                correctAnswer: 'etiquette',
                options: [], explanation: 'Định nghĩa của phép lịch sự.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'A person who is very friendly and welcomes guests with food and drink is showing [1].',
                correctAnswer: 'hospitality',
                options: [], explanation: 'Định nghĩa của lòng hiếu khách.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'If a culture includes many different types of people, languages, and ideas, it is [1].',
                correctAnswer: 'diverse',
                options: [], explanation: 'Định nghĩa của sự đa dạng.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'A pattern or an object that represents a particular country or an idea is a [1].',
                correctAnswer: 'symbol',
                options: [], explanation: 'Định nghĩa của biểu tượng.',
                level: 'A2', topicId: cultureTopic._id
            },
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'The history, traditions, and buildings that a country has had for many years are its [1].',
                correctAnswer: 'heritage',
                options: [], explanation: 'Định nghĩa của di sản.',
                level: 'B1', topicId: cultureTopic._id
            },

            // ==================== LISTENING - CLOZE TEST (5 bài - Không có list từ) ====================
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill in the missing words: \n "We must show [1] to the older [2] because they teach us our important [3]."',
                audioUrl: 'We must show respect to the older generations because they teach us our important values.',
                correctAnswer: 'respect/generations/values',
                options: [], explanation: 'Nghe và điền: tôn trọng, thế hệ, giá trị.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill in the missing words: \n "Every year, we [1] the harvest [2]. Everyone wears a traditional [3]."',
                audioUrl: 'Every year, we celebrate the harvest festival. Everyone wears a traditional costume.',
                correctAnswer: 'celebrate/festival/costume',
                options: [], explanation: 'Nghe và điền: ăn mừng, lễ hội, trang phục.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill in the missing words: \n "A bow is a formal [1]. It is a [2] that follows our social [3]."',
                audioUrl: 'A bow is a formal greeting. It is a custom that follows our social etiquette.',
                correctAnswer: 'greeting/custom/etiquette',
                options: [], explanation: 'Nghe và điền: lời chào, phong tục, phép lịch sự.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill in the missing words: \n "In this [1] city, people show great [2] despite having different [3]."',
                audioUrl: 'In this diverse city, people show great hospitality despite having different beliefs.',
                correctAnswer: 'diverse/hospitality/beliefs',
                options: [], explanation: 'Nghe và điền: đa dạng, hiếu khách, niềm tin.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill in the missing words: \n "The [1] was a long [2] that included many ancient [3]."',
                audioUrl: 'The ceremony was a long tradition that included many ancient symbols.',
                correctAnswer: 'ceremony/tradition/symbols',
                options: [], explanation: 'Nghe và điền: nghi lễ, truyền thống, biểu tượng.',
                level: 'B1', topicId: cultureTopic._id
            },

            // ==================== LISTENING - FILL IN BLANK (5 bài) ====================
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'Identify the cultural concept: [1].',
                audioUrl: 'This secret recipe has been passed down from my great-grandmother to my mother, and now to me.',
                correctAnswer: 'tradition',
                options: [], explanation: 'Việc truyền lại qua nhiều đời là truyền thống.',
                level: 'A2', topicId: cultureTopic._id
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What are the children learning? [1].',
                audioUrl: 'The children are learning how to be polite and how to act correctly at a formal dinner table.',
                correctAnswer: 'etiquette',
                options: [], explanation: 'Cách hành xử lịch sự trên bàn ăn là etiquette.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'The Great Wall is part of the world\'s cultural [1].',
                audioUrl: 'We are visiting the Great Wall today. It is a very important part of the world\'s cultural heritage.',
                correctAnswer: 'heritage',
                options: [], explanation: 'Di sản văn hóa thế giới.',
                level: 'B1', topicId: cultureTopic._id
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'The speaker describes the dove as a [1] of peace.',
                audioUrl: 'In many parts of the world, people recognize the dove as a symbol of peace.',
                correctAnswer: 'symbol',
                options: [], explanation: 'Biểu tượng của hòa bình.',
                level: 'A2', topicId: cultureTopic._id
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'The villagers are known for their [1].',
                audioUrl: 'Even though the villagers didn\'t know the travelers, they shared their food and home. They are known for their hospitality.',
                correctAnswer: 'hospitality',
                options: [], explanation: 'Sự hiếu khách của dân làng.',
                level: 'B1', topicId: cultureTopic._id
            }
        ];

        await Exercise.insertMany(exercises);
        console.log('✅ Created Exercises:', exercises.length, 'exercises');

        console.log('🚀 Seeding Weather (A1) completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();