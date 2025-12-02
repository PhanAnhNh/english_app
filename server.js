// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('./config/constants');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const connectDB = require('./config/database');

connectDB(); // Gọi hàm kết nối

const createToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập.' });

    // Header dạng: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token không đúng định dạng.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Truy cập bị từ chối: Cần quyền Admin.' });
    next();
};

// ==========================================
// 2. SCHEMAS / MODELS (CẤU TRÚC DỮ LIỆU)
// ==========================================

// A. User
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'student', enum: ['student', 'admin'] },
    email: { type: String, index: true },
    level: { type: String, default: 'A' },
    fullname: { type: String, required: true },
    avatarUrl: String,

    // Gamification
    xp: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('users', UserSchema);

// B. Vocabulary
const VocabularySchema = new mongoose.Schema({
    word: { type: String, required: true, index: true },
    meaning: { type: String, required: true },
    pronunciation: String,
    type: String, // noun, verb...
    level: String, // A, B, C
    topic: String,
    example: String,
    audioUrl: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});
const Vocabulary = mongoose.model('vocabularies', VocabularySchema);

// C. Grammar
const GrammarSchema = new mongoose.Schema({
    title: { type: String, required: true },
    level: String,
    structure: String,
    content: String,
    example: String,
    isPublished: { type: Boolean, default: false },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'grammar_categories' },
    createdAt: { type: Date, default: Date.now }
});
const Grammar = mongoose.model('grammars', GrammarSchema);

// Grammar catagories
const GrammarCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    icon: String,
    order: { type: Number, default: 0 },
    level: { type: String, enum: ['A', 'B', 'C'], default: 'A' },
    isActive: { type: Boolean, default: true },
    parentCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'grammar_categories' }, // Danh mục cha (cho cây phân cấp)
    createdAt: { type: Date, default: Date.now }
});
const GrammarCategory = mongoose.model('grammar_categories', GrammarCategorySchema);

// D. Exercise
const ExerciseSchema = new mongoose.Schema({
    skill: String, // vocab, grammar, listening
    type: String, // multiple_choice, fill_in_blank
    questionText: String,
    audioUrl: String,
    options: [{ text: String, isCorrect: Boolean }], // Mảng object đáp án
    correctAnswer: String,
    explanation: String,
    level: String,
    topicRef: String,
    createdAt: { type: Date, default: Date.now }
});
// Thêm schema cho bài nghe
const ListeningSchema = new mongoose.Schema({
    title: String,
    audioUrl: { type: String, required: true },
    transcript: String,
    level: String,
    topic: String,
    duration: Number, // thời lượng audio (giây)
    questions: [{
        questionText: String,
        startTime: Number, // thời điểm bắt đầu câu hỏi trong audio
        options: [String],
        correctAnswer: String
    }],
    createdAt: { type: Date, default: Date.now }
});
const Exercise = mongoose.model('exercises', ExerciseSchema);

// E. Topic (Unit)
const TopicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    level: String,
    imageUrl: String,
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Topic = mongoose.model('topics', TopicSchema);

// F. Lesson
const LessonSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'topics' },
    title: String,
    content: String,
    order: { type: Number, default: 0 },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'exercises' }],
    createdAt: { type: Date, default: Date.now }
});
const Lesson = mongoose.model('lessons', LessonSchema);

// G. Submission (Bài làm)
const SubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'exercises' },
    type: String,
    score: Number,
    userAnswer: String,
    teacherFeedback: String,
    submittedAt: { type: Date, default: Date.now }
});
const Submission = mongoose.model('submissions', SubmissionSchema);

// H. Progress (Tiến độ Lesson)
const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'topics' },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'lessons' },
    completed: { type: Boolean, default: false },
    score: Number,
    lastUpdated: { type: Date, default: Date.now }
});
const Progress = mongoose.model('progress', ProgressSchema);

// I. Streak
const StreakSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', unique: true },
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastStudyDate: Date
});
const Streak = mongoose.model('streaks', StreakSchema);

// J. Admin Logs
const AdminLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    action: String,
    meta: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});
const AdminLog = mongoose.model('admin_logs', AdminLogSchema);

// Schema cho thành tích
const AchievementSchema = new mongoose.Schema({
    name: String,
    description: String,
    icon: String,
    type: { type: String, enum: ['streak', 'vocab', 'exercise', 'level'] },
    requirement: Number, // số lượng cần đạt
    rewardGems: Number,
    createdAt: { type: Date, default: Date.now }
});
const Achievement = mongoose.model('achievements', AchievementSchema);

// Schema cho user achievements
const UserAchievementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'achievements' },
    unlockedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 }
});
const UserAchievement = mongoose.model('user_achievements', UserAchievementSchema);

// Schema cho notifications
const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    title: String,
    message: String,
    type: { type: String, enum: ['reminder', 'achievement', 'system'] },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('notifications', NotificationSchema);

const LeaderboardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    xp: Number,
    level: String,
    rank: Number,
    week: Number, // tuần trong năm
    createdAt: { type: Date, default: Date.now }
});
const Listening = mongoose.model('listenings', ListeningSchema);
// --- AUTH ---
app.post('/api/register', async (req, res) => {
    try {
        // Nhận dữ liệu từ request body
        const { fullname, username, password, email } = req.body;

        // Public registration: luôn tạo tài khoản student
        const role = 'student'; // force role to student regardless of client input

        // Validate required fields and return which are missing
        const missing = [];
        if (!fullname) missing.push('fullname');
        if (!username) missing.push('username');
        if (!password) missing.push('password');
        if (missing.length) {
            return res.status(400).json({
                message: `Thiếu trường: ${missing.join(', ')}`,
                missingFields: missing
            });
        }

        // Kiểm tra username đã tồn tại chưa
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: 'Username đã tồn tại' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Tạo user mới
        const user = new User({
            fullname,
            username,
            passwordHash: hash,
            role,
            email: email || null // email có thể optional
        });
        await user.save();

        // Tạo token
        const token = createToken({
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role
        });

        // Trả về response
        res.json({
            message: 'Đăng ký thành công',
            user: {
                id: user._id,
                username: user.username,
                fullname: user.fullname,
                role: user.role,
                email: user.email
            },
            token
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(400).json({ message: 'Sai username hoặc password' });
        }

        const token = createToken({
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role
        });

        res.json({
            message: 'Đăng nhập thành công',
            user: {
                id: user._id,
                username: user.username,
                fullname: user.fullname, // Thêm vào đây
                role: user.role
            },
            token
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ADMIN LOGIN (Chỉ admin được phép đăng nhập vào web admin)
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(400).json({ message: 'Sai username hoặc password' });
        }

        // Chỉ cho phép admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ Admin được phép đăng nhập vào web admin' });
        }

        const token = createToken({
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role
        });

        res.json({
            message: 'Đăng nhập admin thành công',
            user: {
                id: user._id,
                username: user.username,
                fullname: user.fullname,
                role: user.role
            },
            token
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USER MANAGEMENT (Admin only) ---
app.post('/api/admin/add_users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { fullname, username, password, email, role, level, avatarUrl } = req.body;

        // Validate required fields
        const missing = [];
        if (!fullname) missing.push('fullname');
        if (!username) missing.push('username');
        if (!password) missing.push('password');
        if (missing.length) return res.status(400).json({ message: `Thiếu trường: ${missing.join(', ')}`, missingFields: missing });

        // Kiểm tra username tồn tại
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: 'Username đã tồn tại' });

        // Role chỉ cho phép các giá trị hợp lệ, mặc định 'student'
        const allowedRoles = ['student', 'admin'];
        const userRole = allowedRoles.includes(role) ? role : 'student';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = new User({ fullname, username, passwordHash: hash, role: userRole, email, level, avatarUrl });
        await user.save();

        // Ghi log admin action
        await AdminLog.create({ adminId: req.user.id, action: 'create_user', meta: { id: user._id, role: user.role } });

        res.json({ message: 'Tạo user thành công', user: { id: user._id, username: user.username, fullname: user.fullname, role: user.role, email: user.email } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Lấy danh sách users với phân trang và lọc
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { role, search, level } = req.query;

        // Tạo bộ lọc
        let filter = {};
        if (role) filter.role = role;
        if (level) filter.level = level;
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { fullname: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const total = await User.countDocuments(filter);

        const users = await User.find(filter)
            .select('-passwordHash') // Không trả về password
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: users
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Lấy chi tiết user
app.get('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Cập nhật thông tin user
app.put('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { fullname, username, email, role, level, xp, gems, avatarUrl } = req.body;

        // Kiểm tra user tồn tại
        const existingUser = await User.findById(req.params.id);
        if (!existingUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra username trùng (trừ chính user đang được update)
        if (username && username !== existingUser.username) {
            const usernameExists = await User.findOne({
                username,
                _id: { $ne: req.params.id }
            });
            if (usernameExists) {
                return res.status(400).json({ message: 'Username đã tồn tại' });
            }
        }

        const updateData = {
            ...(fullname && { fullname }),
            ...(username && { username }),
            ...(email && { email }),
            ...(role && { role }),
            ...(level && { level }),
            ...(xp !== undefined && { xp }),
            ...(gems !== undefined && { gems }),
            ...(avatarUrl && { avatarUrl })
        };

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-passwordHash');

        // Ghi log admin action
        await AdminLog.create({
            adminId: req.user.id,
            action: 'update_user',
            meta: {
                userId: req.params.id,
                updates: Object.keys(updateData)
            }
        });

        res.json(updatedUser);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Reset mật khẩu user (Admin reset password cho user)
app.put('/api/admin/users/:id/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu mới' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Hash password mới
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        user.passwordHash = newPasswordHash;
        await user.save();

        // Ghi log admin action
        await AdminLog.create({
            adminId: req.user.id,
            action: 'reset_user_password',
            meta: { userId: req.params.id }
        });

        res.json({ message: 'Đã reset mật khẩu thành công' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Xóa user
app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Không cho phép xóa chính mình
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
        }

        await User.findByIdAndDelete(req.params.id);

        // Ghi log admin action
        await AdminLog.create({
            adminId: req.user.id,
            action: 'delete_user',
            meta: {
                deletedUserId: req.params.id,
                deletedUsername: user.username
            }
        });

        res.json({ message: 'Đã xóa người dùng thành công' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Thống kê users (số lượng theo role, level)
app.get('/api/admin/users-stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const studentsCount = await User.countDocuments({ role: 'student' });
        const adminsCount = await User.countDocuments({ role: 'admin' });

        const levelStats = await User.aggregate([
            {
                $group: {
                    _id: '$level',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentUsers = await User.find()
            .select('username fullname role level createdAt') // Chỉ 1 lệnh select
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalUsers,
            studentsCount,
            adminsCount,
            levelStats,
            recentUsers
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// User tự cập nhật thông tin cá nhân
app.put('/api/profile', authMiddleware, async (req, res) => {
    try {
        const { fullname, email, level, avatarUrl } = req.body;
        const userId = req.user.id;

        // Chỉ cho phép update các field không nhạy cảm
        const updateData = {
            ...(fullname && { fullname }),
            ...(email && { email }),
            ...(level && { level }),
            ...(avatarUrl && { avatarUrl })
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-passwordHash');

        res.json({
            message: 'Cập nhật thông tin thành công',
            user: updatedUser
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// User tự đổi mật khẩu
app.put('/api/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ mật khẩu hiện tại và mật khẩu mới' });
        }

        // Lấy user từ database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra mật khẩu hiện tại
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu
        user.passwordHash = newPasswordHash;
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// User xem profile của chính mình (giống /api/me nhưng có thêm các thông tin khác nếu cần)
app.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-passwordHash')
            .populate('streak'); // Nếu muốn populate thêm thông tin streak

        // Lấy thêm thông tin streak nếu có
        const streak = await Streak.findOne({ userId: req.user.id });

        res.json({
            ...user.toObject(),
            streak: streak || { current: 0, longest: 0 }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- VOCABULARY (Có Phân trang & Sort) ---
app.get('/api/vocab', authMiddleware, async (req, res) => {
    try {
        // 1. Nhận tham số từ URL
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // 2. Tạo bộ lọc
        const { level, topic, search } = req.query;
        let filter = {};
        if (level) filter.level = level;
        if (topic) filter.topic = topic;
        if (search) filter.word = { $regex: search, $options: 'i' };

        // 3. Tính toán phân trang
        const skip = (page - 1) * limit;
        const total = await Vocabulary.countDocuments(filter);

        // 4. Query dữ liệu
        const data = await Vocabulary.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        // 5. Trả về cấu trúc chuẩn
        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: data // Dữ liệu nằm trong mảng 'data'
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Lấy chi tiết 1 từ vựng (Dùng cho màn hình Detail hoặc Edit)
app.get('/api/detail_vocab/:id', authMiddleware, async (req, res) => {
    try {
        const item = await Vocabulary.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
        res.json(item);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/vocab', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const item = new Vocabulary(req.body);
        await item.save();
        await AdminLog.create({ adminId: req.user.id, action: 'create_vocab', meta: { id: item._id } });
        res.json(item);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/vocab/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updated = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/vocab/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Vocabulary.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thành công' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// API thống kê học tập cho user
app.get('/api/learning-stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Thống kê tổng quan
        const totalVocab = await Vocabulary.countDocuments();
        const learnedVocab = await Progress.countDocuments({
            userId, completed: true
        });

        const totalExercises = await Exercise.countDocuments();
        const completedExercises = await Submission.countDocuments({ userId });

        // Tiến độ theo level
        const levelProgress = await Progress.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $lookup: { from: 'topics', localField: 'topicId', foreignField: '_id', as: 'topic' } },
            {
                $group: {
                    _id: '$topic.level',
                    completed: { $sum: { $cond: ['$completed', 1, 0] } },
                    total: { $sum: 1 }
                }
            }
        ]);

        // Điểm số trung bình
        const averageScore = await Submission.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, avgScore: { $avg: '$score' } } }
        ]);

        res.json({
            learnedVocab,
            totalVocab,
            completedExercises,
            totalExercises,
            levelProgress,
            averageScore: averageScore[0]?.avgScore || 0,
            completionRate: Math.round((learnedVocab / totalVocab) * 100) || 0
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Thêm categories
app.get('/api/grammar-categories', authMiddleware, async (req, res) => {
    try {
        const categories = await GrammarCategory.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 });
        res.json(categories);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// API lấy tất cả chủ đề grammar (đã có, nhưng cần thêm số lượng bài)
app.get('/api/grammar-categories-with-count', authMiddleware, async (req, res) => {
    try {
        const { level } = req.query;

        let filter = { isActive: true };
        if (level) filter.level = level;

        // Lấy tất cả categories
        const categories = await GrammarCategory.find(filter)
            .sort({ order: 1, createdAt: -1 });

        // Thêm số lượng grammar trong mỗi category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const grammarCount = await Grammar.countDocuments({
                    categoryId: category._id,
                    isPublished: true
                });

                // Lấy 3 bài grammar mới nhất trong category
                const recentGrammars = await Grammar.find({
                    categoryId: category._id,
                    isPublished: true
                })
                    .sort({ createdAt: -1 })
                    .limit(3)
                    .select('title level');

                return {
                    id: category._id,
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    level: category.level,
                    order: category.order,
                    grammarCount,
                    recentGrammars,
                    createdAt: category.createdAt
                };
            })
        );

        // Filter out categories with 0 grammar
        const filteredCategories = categoriesWithCount.filter(cat => cat.grammarCount > 0);

        res.json({
            total: filteredCategories.length,
            categories: filteredCategories
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// API lấy chi tiết category với danh sách grammar phân trang
app.get('/api/grammar-category/:id', authMiddleware, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            level,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;

        // 1. Lấy thông tin category
        const category = await GrammarCategory.findById(req.params.id);
        if (!category || !category.isActive) {
            return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
        }

        // 2. Tạo filter cho grammar
        let filter = {
            categoryId: category._id,
            isPublished: true
        };

        if (level) filter.level = level;

        // 3. Lấy tổng số và danh sách grammar
        const total = await Grammar.countDocuments(filter);

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const grammarList = await Grammar.find(filter)
            .select('title level structure content example createdAt')
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOptions);

        // 4. Lấy các sub-categories (nếu có)
        const subCategories = await GrammarCategory.find({
            parentCategoryId: category._id,
            isActive: true
        });

        // 5. Lấy category cha (nếu có)
        let parentCategory = null;
        if (category.parentCategoryId) {
            parentCategory = await GrammarCategory.findById(category.parentCategoryId)
                .select('name id');
        }

        res.json({
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
                icon: category.icon,
                level: category.level,
                parentCategory
            },
            grammarList: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
                data: grammarList
            },
            subCategories,
            stats: {
                totalGrammar: total,
                subCategoryCount: subCategories.length
            }
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/grammar-categories/:id', authMiddleware, async (req, res) => {
    try {
        const category = await GrammarCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        res.json(category);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/grammar-categories', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const category = new GrammarCategory(req.body);
        await category.save();
        res.json(category);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/grammar-categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updated = await GrammarCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/grammar-categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await GrammarCategory.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ message: 'Đã ẩn danh mục' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// API lấy Grammar theo Category
app.get('/api/grammar/by-category/:categoryId', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, level } = req.query;
        const skip = (page - 1) * limit;

        let filter = {
            categoryId: req.params.categoryId,
            isPublished: true
        };

        if (level) filter.level = level;

        const total = await Grammar.countDocuments(filter);
        const data = await Grammar.find(filter)
            .populate('categoryId', 'name icon')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            data
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- GRAMMAR (Có Phân trang) ---
app.get('/api/grammar', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const { level, search } = req.query;

        let filter = {};
        if (level) filter.level = level;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        const total = await Grammar.countDocuments(filter);
        const data = await Grammar.find()
            .populate('categoryId', 'name icon') // <-- THÊM populate
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder });

        res.json({ total, page, limit, totalPages: Math.ceil(total / limit), data });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/detail_grammar/:id', authMiddleware, async (req, res) => {
    try {
        const item = await Grammar.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Không tìm thấy bài ngữ pháp' });
        res.json(item);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/add_grammar', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const item = new Grammar(req.body);
        await item.save();
        res.json(item);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/edit_grammar/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updated = await Grammar.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/delet_grammar/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Grammar.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thành công' });
    } catch (e) { res.status(500).json({ error: e.message }); }
})

// --- EXERCISES (Có Phân trang & Lọc) ---
app.get('/api/exercises', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const { skill, level, type, topic, search } = req.query;

        let filter = {};
        if (skill) filter.skill = skill;
        if (level) filter.level = level;
        if (type) filter.type = type;
        if (topic) filter.topicRef = topic;

        if (search) {
            filter.$or = [
                { questionText: { $regex: search, $options: 'i' } },
                { explanation: { $regex: search, $options: 'i' } },
                { 'options.text': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const total = await Exercise.countDocuments(filter);
        const data = await Exercise.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder });

        res.json({ total, page, limit, totalPages: Math.ceil(total / limit), data });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/detail_exercises/:id', authMiddleware, async (req, res) => {
    try {
        const item = await Exercise.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Không tìm thấy bài tập' });
        res.json(item);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/exercises', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const item = new Exercise(req.body);
        await item.save();
        res.json(item);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/edit_exercise/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updated = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/delet_exercise/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Exercise.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thành công' });
    } catch (e) { res.status(500).json({ error: e.message }); }
})

// --- TOPICS (Có Phân trang) ---
app.get('/api/topics', authMiddleware, async (req, res) => {
    try {
        const { level } = req.query;
        let filter = level ? { level } : {};
        const { search } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sortBy = req.query.sortBy || 'order';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : 1; // default ascending by order



        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (page - 1) * limit;

        const total = await Topic.countDocuments(filter);
        const data = await Topic.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        res.json({ total, page, limit, totalPages: Math.ceil(total / limit), data });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/topics', authMiddleware, adminMiddleware, async (req, res) => {
    const t = new Topic(req.body);
    await t.save();
    res.json(t);
});

app.get('/api/detail_topics/:id', authMiddleware, async (req, res) => {
    try {
        const item = await Topic.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
        res.json(item);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/edit_topic/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updated = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/delet_topic/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Topic.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thành công' });
    } catch (e) { res.status(500).json({ error: e.message }); }
})

// --- LESSONS ---
app.get('/api/lessons/:topicId', authMiddleware, async (req, res) => {
    try {
        // Lessons thường ít, nên có thể không cần phân trang, hoặc phân trang đơn giản
        const data = await Lesson.find({ topicId: req.params.topicId })
            .sort({ order: 1 })
            .populate('exercises');

        // Trả về format chuẩn thống nhất
        res.json({
            total: data.length,
            page: 1,
            limit: data.length,
            data: data
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/lessons', authMiddleware, adminMiddleware, async (req, res) => {
    const l = new Lesson(req.body);
    await l.save();
    res.json(l);
});

app.get('/api/detail_lesson/:id', authMiddleware, async (req, res) => {
    try {
        const item = await Lesson.findById(req.params.id).populate('exercises');
        if (!item) return res.status(404).json({ message: 'Không tìm thấy bài học' });
        res.json(item);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/edit_lessons/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/delet_lessons/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Lesson.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thành công' });
    } catch (e) { res.status(500).json({ error: e.message }); }
})

// --- SUBMISSION & PROGRESS ---
app.post('/api/submit', authMiddleware, async (req, res) => {
    try {
        const payload = req.body;
        payload.userId = payload.userId || req.user.id;
        const submission = new Submission(payload);
        await submission.save();
        res.json({ message: 'Nộp bài thành công', id: submission._id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/progress', authMiddleware, async (req, res) => {
    try {
        const { userId, topicId, lessonId, score } = req.body;
        const uid = userId || req.user.id;

        let progress = await Progress.findOne({ userId: uid, lessonId });
        if (!progress) {
            progress = new Progress({ userId: uid, topicId, lessonId, completed: true, score });
        } else {
            progress.score = score;
            progress.completed = true;
            progress.lastUpdated = new Date();
        }
        await progress.save();
        res.json(progress);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- STREAK ---
app.get('/api/my-streak', authMiddleware, async (req, res) => {
    try {
        // Lấy ID trực tiếp từ người đang đăng nhập (An toàn hơn)
        const userId = req.user.id;

        const streak = await Streak.findOne({ userId: userId });
        res.json(streak || { current: 0, longest: 0 });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/streak', authMiddleware, async (req, res) => {
    try {
        const uid = req.body.userId || req.user.id;
        const todayStr = new Date().toDateString();

        let streak = await Streak.findOne({ userId: uid });
        if (!streak) {
            streak = new Streak({ userId: uid, current: 1, longest: 1, lastStudyDate: new Date() });
        } else {
            const lastStr = streak.lastStudyDate ? new Date(streak.lastStudyDate).toDateString() : null;
            if (lastStr !== todayStr) {
                const lastDate = new Date(streak.lastStudyDate);
                const today = new Date();
                const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

                if (diffDays <= 1) streak.current += 1;
                else streak.current = 1;

                streak.longest = Math.max(streak.longest, streak.current);
                streak.lastStudyDate = new Date();
            }
        }
        await streak.save();
        res.json(streak);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ADMIN LOGS ---
app.get('/api/admin/logs', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await AdminLog.countDocuments();
        const data = await AdminLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.json({ total, page, limit, totalPages: Math.ceil(total / limit), data });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// API để check và unlock achievements
app.post('/api/check-achievements', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const unlocked = [];

        // Check streak achievements
        const streak = await Streak.findOne({ userId });
        if (streak) {
            const streakAchievements = await Achievement.find({ type: 'streak' });
            for (let achievement of streakAchievements) {
                if (streak.current >= achievement.requirement) {
                    const exists = await UserAchievement.findOne({ userId, achievementId: achievement._id });
                    if (!exists) {
                        await UserAchievement.create({ userId, achievementId: achievement._id });

                        // Thưởng gems
                        await User.findByIdAndUpdate(userId, {
                            $inc: { gems: achievement.rewardGems }
                        });

                        unlocked.push(achievement);
                    }
                }
            }
        }

        res.json({ unlocked });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


// API theo dõi tiến độ chi tiết
app.get('/api/progress/detailed', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { days = 30 } = req.query;

        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        // Thống kê học tập theo ngày
        const dailyProgress = await Submission.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    submittedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$submittedAt' },
                        month: { $month: '$submittedAt' },
                        day: { $dayOfMonth: '$submittedAt' }
                    },
                    exercisesCompleted: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    totalXP: { $sum: '$score' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
        ]);

        res.json({ dailyProgress });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// API search toàn diện
app.get('/api/search', authMiddleware, async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;

        if (!q) return res.status(400).json({ message: 'Thiếu từ khóa tìm kiếm' });

        const results = {};

        if (type === 'all' || type === 'vocab') {
            results.vocabularies = await Vocabulary.find({
                $or: [
                    { word: { $regex: q, $options: 'i' } },
                    { meaning: { $regex: q, $options: 'i' } },
                    { example: { $regex: q, $options: 'i' } }
                ]
            }).limit(10);
        }

        if (type === 'all' || type === 'grammar') {
            results.grammars = await Grammar.find({
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { content: { $regex: q, $options: 'i' } }
                ]
            }).limit(10);
        }

        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
});


// API gửi reminder học tập
app.post('/api/send-reminder', authMiddleware, async (req, res) => {
    try {
        // Gửi reminder cho users không học trong 2 ngày
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

        const inactiveUsers = await Streak.find({
            lastStudyDate: { $lt: twoDaysAgo }
        }).populate('userId');

        for (let streak of inactiveUsers) {
            await Notification.create({
                userId: streak.userId._id,
                title: 'Nhắc nhở học tập 📚',
                message: 'Bạn đã bỏ lỡ 2 ngày học! Hãy quay lại để giữ streak nhé!',
                type: 'reminder'
            });
        }

        res.json({ message: `Đã gửi reminder cho ${inactiveUsers.length} users` });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// API leaderboard
app.get('/api/leaderboard', authMiddleware, async (req, res) => {
    try {
        const { type = 'weekly', limit = 50 } = req.query;

        const leaderboard = await User.find()
            .select('fullname xp level avatarUrl')
            .sort({ xp: -1 })
            .limit(parseInt(limit));

        // Thêm rank
        const ranked = leaderboard.map((user, index) => ({
            ...user.toObject(),
            rank: index + 1
        }));

        res.json(ranked);
    } catch (e) { res.status(500).json({ error: e.message }); }
});
// 404 Handler
app.use((req, res) => res.status(404).json({ message: 'API Endpoint không tồn tại' }));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server đang chạy tại port ${PORT}`));