require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const http = require('http'); // Cần thiết cho Socket.io
const { Server } = require("socket.io");
const socketManager = require('./socket/socketManager'); // Import file logic vừa tạo

const app = express();

// --- MIDDEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// --- DATABASE ---
connectDB();

// --- ROUTES ---
// (Giữ nguyên phần import routes của bạn)
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
const landingPageRoutes = require('./routes/landingPageRoutes');
const listeningRoutes = require('./routes/listeningRouter');
const aiRoutes = require('./routes/aiRoutes');
const ttsRoutes = require('./routes/ttsRoutes');
const matchRoutes = require('./routes/matchRoutes');

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
app.use('/api', grammarExerciseRoutes);
app.use('/api/landing-page', landingPageRoutes);
app.use('/api/listenings', listeningRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/matches', matchRoutes); // Route này để xem lịch sử đấu


// 404 Handler
app.use((req, res) => res.status(404).json({ message: 'API Endpoint không tồn tại' }));

// --- SETUP SERVER & SOCKET ---

// 1. Tạo HTTP Server bọc lấy Express App
const server = http.createServer(app);

// 2. Cấu hình Socket.io
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 3. Kích hoạt logic Socket (truyền biến io vào hàm)
socketManager(io);

// --- START SERVER ---
const PORT = process.env.PORT || 3000;

// Lưu ý: Phải dùng server.listen (của http) chứ KHÔNG dùng app.listen
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại port ${PORT}`);
    console.log(`📡 Socket.io đã sẵn sàng kết nối`);
});

// --- ERROR HANDLING ---
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});