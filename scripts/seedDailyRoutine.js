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
        const travelTopic = await Topic.create({
            name: 'Travel & Holidays',
            description: 'Learn how to talk about trips, transport, and famous places.',
            level: 'A2',
            imageUrl: 'https://img.freepik.com/free-vector/travel-concept-illustration_114360-1250.jpg',
            order: 15
        });
        console.log('✅ Created Topic: Travel & Holidays (A2)');

        const vocabItems = [
            { word: 'destination', meaning: 'điểm đến', level: 'A2', topic: travelTopic._id },
            { word: 'luggage', meaning: 'hành lý', level: 'A2', topic: travelTopic._id },
            { word: 'passport', meaning: 'hộ chiếu', level: 'A2', topic: travelTopic._id },
            { word: 'souvenir', meaning: 'quà lưu niệm', level: 'A2', topic: travelTopic._id },
            { word: 'sightseeing', meaning: 'ngắm cảnh', level: 'A2', topic: travelTopic._id },
            { word: 'itinerary', meaning: 'lịch trình', level: 'A2', topic: travelTopic._id },
            { word: 'transport', meaning: 'phương tiện giao thông', level: 'A2', topic: travelTopic._id },
            { word: 'accommodation', meaning: 'chỗ ở (khách sạn...)', level: 'A2', topic: travelTopic._id },
            { word: 'book', meaning: 'đặt (vé/phòng)', level: 'A2', topic: travelTopic._id },
            { word: 'flight', meaning: 'chuyến bay', level: 'A2', topic: travelTopic._id },
            { word: 'tourist', meaning: 'khách du lịch', level: 'A2', topic: travelTopic._id },
            { word: 'explore', meaning: 'khám phá', level: 'A2', topic: travelTopic._id },
            { word: 'famous', meaning: 'nổi tiếng', level: 'A2', topic: travelTopic._id },
            { word: 'journey', meaning: 'hành trình', level: 'A2', topic: travelTopic._id },
            { word: 'adventure', meaning: 'cuộc phiêu lưu', level: 'A2', topic: travelTopic._id },
            { word: 'relax', meaning: 'thư giãn', level: 'A2', topic: travelTopic._id }
        ];
        await Vocabulary.insertMany(vocabItems);
        console.log('✅ Created Vocabulary items (16 từ cơ bản A1)');

        // 3. Create Exercises (đủ 40 bài tập - câu hỏi tự nhiên hơn, gần gũi như nói chuyện hàng ngày)
        const exercises = [
            // ==================== LISTENING - MULTIPLE CHOICE (15 bài) ====================
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'Where is the man going for his holiday?',
                audioUrl: 'I am so happy. Tomorrow, I will fly to Paris. It is my favorite destination.',
                options: [{ text: 'London', isCorrect: false }, { text: 'Paris', isCorrect: true }, { text: 'New York', isCorrect: false }, { text: 'Tokyo', isCorrect: false }],
                correctAnswer: 'Paris', explanation: 'Người nói nhắc trực tiếp đến Paris.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What does the woman need to bring to the airport?',
                audioUrl: 'Oh no! I have my luggage and my ticket, but I cannot find my passport.',
                options: [{ text: 'Souvenir', isCorrect: false }, { text: 'Camera', isCorrect: false }, { text: 'Passport', isCorrect: true }, { text: 'Book', isCorrect: false }],
                correctAnswer: 'Passport', explanation: 'Passport là thứ cô ấy đang tìm.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What activity are they going to do now?',
                audioUrl: 'The weather is beautiful. Let’s go sightseeing and take some photos of the city.',
                options: [{ text: 'Sightseeing', isCorrect: true }, { text: 'Booking a flight', isCorrect: false }, { text: 'Sleeping', isCorrect: false }, { text: 'Eating', isCorrect: false }],
                correctAnswer: 'Sightseeing', explanation: 'Cụm từ "go sightseeing" được nói rõ.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'How will they travel to the island?',
                audioUrl: 'The island is near here, so we will take a boat. It is a cheap transport.',
                options: [{ text: 'Plane', isCorrect: false }, { text: 'Train', isCorrect: false }, { text: 'Boat', isCorrect: true }, { text: 'Bus', isCorrect: false }],
                correctAnswer: 'Boat', explanation: 'Phương tiện là boat.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What did the boy buy for his mother?',
                audioUrl: 'I went to the gift shop and bought a small souvenir for my mother.',
                options: [{ text: 'Passport', isCorrect: false }, { text: 'Luggage', isCorrect: false }, { text: 'Souvenir', isCorrect: true }, { text: 'Itinerary', isCorrect: false }],
                correctAnswer: 'Souvenir', explanation: 'Người con mua souvenir.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'Where are they going to stay?',
                audioUrl: 'The hotel is too expensive, so we found a small apartment for our accommodation.',
                options: [{ text: 'Hotel', isCorrect: false }, { text: 'Apartment', isCorrect: true }, { text: 'Tent', isCorrect: false }, { text: 'Park', isCorrect: false }],
                correctAnswer: 'Apartment', explanation: 'Accommodation (chỗ ở) họ chọn là apartment.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What does the man need to do for the hotel?',
                audioUrl: 'The hotel is very busy in summer. You should book your room early.',
                options: [{ text: 'Clean', isCorrect: false }, { text: 'Book', isCorrect: true }, { text: 'Sell', isCorrect: false }, { text: 'Fix', isCorrect: false }],
                correctAnswer: 'Book', explanation: 'Book nghĩa là đặt phòng trước.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What are they doing in the forest?',
                audioUrl: 'I love nature. Let’s explore the forest and see the birds.',
                options: [{ text: 'Explore', isCorrect: true }, { text: 'Book', isCorrect: false }, { text: 'Buy', isCorrect: false }, { text: 'Work', isCorrect: false }],
                correctAnswer: 'Explore', explanation: 'Họ đi khám phá (explore) khu rừng.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'Why do many tourists visit this museum?',
                audioUrl: 'This museum is very famous. It has many old paintings.',
                options: [{ text: 'It is new', isCorrect: false }, { text: 'It is famous', isCorrect: true }, { text: 'It is small', isCorrect: false }, { text: 'It is cheap', isCorrect: false }],
                correctAnswer: 'Famous', explanation: 'Bảo tàng nổi tiếng (famous).',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What are they talking about?',
                audioUrl: 'Our journey to the mountains was long but very beautiful.',
                options: [{ text: 'A flight', isCorrect: false }, { text: 'A journey', isCorrect: true }, { text: 'A passport', isCorrect: false }, { text: 'A souvenir', isCorrect: false }],
                correctAnswer: 'A journey', explanation: 'Họ nói về hành trình (journey) đi lên núi.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What is the man’s plan for the weekend?',
                audioUrl: 'It’s been a busy week. I just want to go to the beach and relax.',
                options: [{ text: 'Work', isCorrect: false }, { text: 'Study', isCorrect: false }, { text: 'Relax', isCorrect: true }, { text: 'Cook', isCorrect: false }],
                correctAnswer: 'Relax', explanation: 'Anh ấy muốn thư giãn (relax).',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What does the girl show her friend?',
                audioUrl: 'Look at my itinerary. We will visit the museum on Monday and the park on Tuesday.',
                options: [{ text: 'Passport', isCorrect: false }, { text: 'Souvenir', isCorrect: false }, { text: 'Itinerary', isCorrect: true }, { text: 'Luggage', isCorrect: false }],
                correctAnswer: 'Itinerary', explanation: 'Cô ấy cho bạn xem lịch trình (itinerary).',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What happened to the woman’s luggage?',
                audioUrl: 'I am so sad. The airline lost my luggage at the airport.',
                options: [{ text: 'It is heavy', isCorrect: false }, { text: 'It is new', isCorrect: false }, { text: 'It is lost', isCorrect: true }, { text: 'It is small', isCorrect: false }],
                correctAnswer: 'It is lost', explanation: 'Hành lý (luggage) bị mất.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'How was their trip to the jungle?',
                audioUrl: 'It was a great adventure. We saw many wild animals!',
                options: [{ text: 'Boring', isCorrect: false }, { text: 'Short', isCorrect: false }, { text: 'Adventure', isCorrect: true }, { text: 'Bad', isCorrect: false }],
                correctAnswer: 'Adventure', explanation: 'Chuyến đi là một cuộc phiêu lưu (adventure).',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'multiple_choice',
                questionText: 'What time is the flight?',
                audioUrl: 'Hurry up! Our flight leaves in two hours.',
                options: [{ text: 'In two hours', isCorrect: true }, { text: 'In five hours', isCorrect: false }, { text: 'Tomorrow', isCorrect: false }, { text: 'Next week', isCorrect: false }],
                correctAnswer: 'In two hours', explanation: 'Chuyến bay (flight) khởi hành trong 2 giờ nữa.',
                level: 'A2', topicId: travelTopic._id
            },

            // ==================== READING - MULTIPLE CHOICE (15 bài) ====================
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'When you travel to another country, you must carry your ________ to show at the airport.',
                options: [{ text: 'Passport', isCorrect: true }, { text: 'Souvenir', isCorrect: false }, { text: 'Itinerary', isCorrect: false }, { text: 'Destination', isCorrect: false }],
                correctAnswer: 'Passport', explanation: 'Hộ chiếu là giấy tờ bắt buộc khi đi nước ngoài.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'We need to ________ a hotel room for our summer vacation next month.',
                options: [{ text: 'Relax', isCorrect: false }, { text: 'Explore', isCorrect: false }, { text: 'Book', isCorrect: true }, { text: 'Flight', isCorrect: false }],
                correctAnswer: 'Book', explanation: 'Book ở đây là động từ mang nghĩa "đặt trước".',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'My ________ is very heavy because I put too many clothes in it.',
                options: [{ text: 'Luggage', isCorrect: true }, { text: 'Passport', isCorrect: false }, { text: 'Souvenir', isCorrect: false }, { text: 'Transport', isCorrect: false }],
                correctAnswer: 'Luggage', explanation: 'Hành lý (luggage) nặng do đựng nhiều quần áo.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Paris is a very popular ________ for tourists from all over the world.',
                options: [{ text: 'Destination', isCorrect: true }, { text: 'Itinerary', isCorrect: false }, { text: 'Accommodation', isCorrect: false }, { text: 'Luggage', isCorrect: false }],
                correctAnswer: 'Destination', explanation: 'Destination nghĩa là điểm đến du lịch.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'The Great Wall of China is a very ________ place. Everyone knows it.',
                options: [{ text: 'Famous', isCorrect: true }, { text: 'Boring', isCorrect: false }, { text: 'Small', isCorrect: false }, { text: 'Relax', isCorrect: false }],
                correctAnswer: 'Famous', explanation: 'Famous có nghĩa là nổi tiếng.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'I bought a small ________ for my sister to remember our trip to Japan.',
                options: [{ text: 'Itinerary', isCorrect: false }, { text: 'Souvenir', isCorrect: true }, { text: 'Transport', isCorrect: false }, { text: 'Flight', isCorrect: false }],
                correctAnswer: 'Souvenir', explanation: 'Souvenir là quà lưu niệm.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'We are going ________ tomorrow to see the old temples and museums.',
                options: [{ text: 'Sightseeing', isCorrect: true }, { text: 'Booking', isCorrect: false }, { text: 'Luggage', isCorrect: false }, { text: 'Passport', isCorrect: false }],
                correctAnswer: 'Sightseeing', explanation: 'Go sightseeing là đi ngắm cảnh/tham quan.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Bus, train, and plane are different types of ________.',
                options: [{ text: 'Accommodation', isCorrect: false }, { text: 'Transport', isCorrect: true }, { text: 'Destination', isCorrect: false }, { text: 'Souvenir', isCorrect: false }],
                correctAnswer: 'Transport', explanation: 'Transport là phương tiện giao thông.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'Our ________ to the forest was a real adventure.',
                options: [{ text: 'Journey', isCorrect: true }, { text: 'Passport', isCorrect: false }, { text: 'Luggage', isCorrect: false }, { text: 'Accommodation', isCorrect: false }],
                correctAnswer: 'Journey', explanation: 'Journey là một hành trình/chuyến đi.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'We should look at the ________ to know what we will do each day.',
                options: [{ text: 'Passport', isCorrect: false }, { text: 'Souvenir', isCorrect: false }, { text: 'Itinerary', isCorrect: true }, { text: 'Luggage', isCorrect: false }],
                correctAnswer: 'Itinerary', explanation: 'Itinerary là lịch trình chi tiết.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'The hotel we stayed in was a very comfortable ________.',
                options: [{ text: 'Accommodation', isCorrect: true }, { text: 'Destination', isCorrect: false }, { text: 'Transport', isCorrect: false }, { text: 'Flight', isCorrect: false }],
                correctAnswer: 'Accommodation', explanation: 'Accommodation là chỗ ở (khách sạn, nhà nghỉ...).',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'I want to ________ the island and find hidden beaches.',
                options: [{ text: 'Explore', isCorrect: true }, { text: 'Book', isCorrect: false }, { text: 'Luggage', isCorrect: false }, { text: 'Relax', isCorrect: false }],
                correctAnswer: 'Explore', explanation: 'Explore nghĩa là khám phá.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'My ________ to London leaves at 8 PM from Gate 5.',
                options: [{ text: 'Flight', isCorrect: true }, { text: 'Souvenir', isCorrect: false }, { text: 'Transport', isCorrect: false }, { text: 'Accommodation', isCorrect: false }],
                correctAnswer: 'Flight', explanation: 'Flight là chuyến bay.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'After a long year of work, I just want to ________ on a beach.',
                options: [{ text: 'Explore', isCorrect: false }, { text: 'Relax', isCorrect: true }, { text: 'Luggage', isCorrect: false }, { text: 'Destination', isCorrect: false }],
                correctAnswer: 'Relax', explanation: 'Relax nghĩa là thư giãn.',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'multiple_choice',
                questionText: 'The ________ was very excited to see the Pyramids for the first time.',
                options: [{ text: 'Tourist', isCorrect: true }, { text: 'Passport', isCorrect: false }, { text: 'Accommodation', isCorrect: false }, { text: 'Transport', isCorrect: false }],
                correctAnswer: 'Tourist', explanation: 'Tourist là khách du lịch.',
                level: 'A2', topicId: travelTopic._id
            },

            // ==================== READING - CLOZE TEST & FILL BLANK (Gộp 10 bài) ====================
            // (Cloze Test: 5 bài xáo trộn từ)
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [luggage, flight, destination]. \n I am at the airport. I have my [1], but it is very heavy. My [2] is at 10 AM. I am going to London, my favorite [3].',
                correctAnswer: 'luggage/flight/destination',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [famous, souvenirs, sightseeing]. \n We are in New York. We will go [1] to see the Statue of Liberty. It is very [2]. Later, we will buy some [3] to take home.',
                correctAnswer: 'sightseeing/famous/souvenirs',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [accommodation, book, itinerary]. \n I need to [1] a room for our [2] in Paris. I also have an [3] to plan our visits to the museums.',
                correctAnswer: 'book/accommodation/itinerary',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [explore, relax, transport]. \n During our holiday, we want to [1] the mountains. We will use a bus for [2]. At the end of the day, we just want to [3].',
                correctAnswer: 'explore/transport/relax',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'cloze_test',
                questionText: 'Words: [passport, tourist, adventure]. \n Every [1] needs a [2] to travel abroad. Going to the jungle is a big [3] for us.',
                correctAnswer: 'tourist/passport/adventure',
                level: 'A2', topicId: travelTopic._id
            },
            // (Fill in the Blank: 5 bài định nghĩa)
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'A journey that is exciting and sometimes dangerous is an [1].',
                correctAnswer: 'adventure',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'The place where you are going is your [1].',
                correctAnswer: 'destination',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'A plane, a car, or a bike are all types of [1].',
                correctAnswer: 'transport',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'To go and see famous places in a city is to go [1].',
                correctAnswer: 'sightseeing',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'reading', type: 'fill_in_blank',
                questionText: 'A small thing you buy to remember your holiday is a [1].',
                correctAnswer: 'souvenir',
                level: 'A2', topicId: travelTopic._id
            },

            // ==================== LISTENING - CLOZE TEST & FILL BLANK (Gộp 10 bài) ====================
            // (Listening Cloze: 5 bài không list từ)
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "I need to check my [1] to see the time of our [2]."',
                audioUrl: 'I need to check my itinerary to see the time of our flight.',
                correctAnswer: 'itinerary/flight',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "The [1] was very kind at the hotel [2]."',
                audioUrl: 'The tourist was very kind at the hotel accommodation.',
                correctAnswer: 'tourist/accommodation',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "Don’t forget your [1] and your heavy [2]."',
                audioUrl: 'Don’t forget your passport and your heavy luggage.',
                correctAnswer: 'passport/luggage',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "We will [1] the city and buy some [2]."',
                audioUrl: 'We will explore the city and buy some souvenirs.',
                correctAnswer: 'explore/souvenirs',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'cloze_test',
                questionText: 'Listen and fill: "This place is [1] and very good to [2]."',
                audioUrl: 'This place is famous and very good to relax.',
                correctAnswer: 'famous/relax',
                level: 'A2', topicId: travelTopic._id
            },
            // (Listening Fill Blank: 5 bài nghe trực tiếp)
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What does the man want to do? [1].',
                audioUrl: 'I want to book a room for two nights, please.',
                correctAnswer: 'book',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What is the woman talking about? [1].',
                audioUrl: 'My journey by train was very long.',
                correctAnswer: 'journey',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What activity is mentioned? [1].',
                audioUrl: 'Tomorrow morning, we will go sightseeing.',
                correctAnswer: 'sightseeing',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What is the destination? [1].',
                audioUrl: 'London is our final destination for this trip.',
                correctAnswer: 'destination',
                level: 'A2', topicId: travelTopic._id
            },
            {
                skill: 'listening', type: 'fill_in_blank',
                questionText: 'What is the exciting trip called? An [1].',
                audioUrl: 'Hiking in the mountains was a great adventure.',
                correctAnswer: 'adventure',
                level: 'A2', topicId: travelTopic._id
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