// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// 0. CẤU HÌNH (CONFIG)
// ==========================================

// Lưu ý: Bạn nên để các biến này trong file .env. 
// Tôi để hardcode ở đây để bạn chạy được ngay lập tức.
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:tienganh123321@englishappdb.7wt55du.mongodb.net/english_app?appName=EnglishAppDB';
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_bao_mat_cua_ban';
const JWT_EXPIRES_IN = '30d';

// ==========================================
// 1. HELPER FUNCTIONS & MIDDLEWARE
// ==========================================

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
    createdAt: { type: Date, default: Date.now }
});
const Grammar = mongoose.model('grammars', GrammarSchema);

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

// ==========================================
// 3. KẾT NỐI DATABASE
// ==========================================

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));


// ==========================================
// 4. API ROUTES (ENDPOINTS)
// ==========================================

// --- AUTH ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, role = 'student', email } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Thiếu username hoặc password' });

        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: 'Username đã tồn tại' });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = new User({ username, passwordHash: hash, role, email });
        await user.save();

        const token = createToken({ id: user._id, username: user.username, role: user.role });
        res.json({ message: 'Đăng ký thành công', user: { id: user._id, username: user.username, role: user.role }, token });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(400).json({ message: 'Sai username hoặc password' });
        }

        const token = createToken({ id: user._id, username: user.username, role: user.role });
        res.json({ message: 'Đăng nhập thành công', user: { id: user._id, username: user.username, role: user.role }, token });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USER MANAGEMENT (Admin only) ---

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
                { email: { $regex: search, $options: 'i' } }
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
        const { username, email, role, level, xp, gems, avatarUrl } = req.body;

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
            .select('username role level createdAt')
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
        const { email, level, avatarUrl } = req.body;
        const userId = req.user.id;

        // Chỉ cho phép update các field không nhạy cảm
        const updateData = {
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

// --- GRAMMAR (Có Phân trang) ---
app.get('/api/grammar', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Grammar.countDocuments();
        const data = await Grammar.find().skip(skip).limit(limit).sort({ createdAt: -1 });

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
        const { skill, level, type } = req.query;

        let filter = {};
        if (skill) filter.skill = skill;
        if (level) filter.level = level;
        if (type) filter.type = type;

        const skip = (page - 1) * limit;
        const total = await Exercise.countDocuments(filter);
        const data = await Exercise.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });

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

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100; // Mặc định lấy nhiều topic
        const skip = (page - 1) * limit;

        const total = await Topic.countDocuments(filter);
        const data = await Topic.find(filter).sort({ order: 1 }).skip(skip).limit(limit);

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

// 404 Handler
app.use((req, res) => res.status(404).json({ message: 'API Endpoint không tồn tại' }));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server đang chạy tại port ${PORT}`));