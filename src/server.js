// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Để đọc cookies từ request

// Enable CORS with credentials so HttpOnly cookies can be sent from the frontend.
// In production, replace origin: true with your specific client origin (e.g. process.env.CLIENT_URL)
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


// Kết nối database
connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vocabularyRoutes = require('./routes/vocabularyRoutes');
const grammarRoutes = require('./routes/grammarRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const topicRoutes = require('./routes/topicRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const progressRoutes = require('./routes/progressRoutes');
const streakRoutes = require('./routes/streakRoutes');
const adminRoutes = require('./routes/adminRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const searchRoutes = require('./routes/searchRoutes');
const userVocabularyRoutes = require('./routes/userVocabularyRoutes');
const grammarExerciseRoutes = require('./routes/grammarExerciseRoutes');

// Sử dụng routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', vocabularyRoutes);
app.use('/api', grammarRoutes);
app.use('/api', exerciseRoutes);
app.use('/api', topicRoutes);
app.use('/api', lessonRoutes);
app.use('/api', progressRoutes);
app.use('/api', streakRoutes);
app.use('/api', adminRoutes);
app.use('/api', achievementRoutes);
app.use('/api', searchRoutes);
app.use('/api/user-vocabulary', userVocabularyRoutes);
app.use('/api/grammar-exercises', grammarExerciseRoutes);

// 404 Handler
app.use((req, res) => res.status(404).json({ message: 'API Endpoint không tồn tại' }));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server đang chạy tại port ${PORT}`));
