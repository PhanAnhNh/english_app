const bcrypt = require('bcrypt');
const User = require('../model/User');
const Streak = require('../model/Streak');
const AdminLog = require('../model/AdminLog');

const addUser = async (userData, adminId) => {
    const { fullname, username, password, email, role, level, avatarUrl } = userData;

    // Validate required fields
    const missing = [];
    if (!fullname) missing.push('fullname');
    if (!username) missing.push('username');
    if (!password) missing.push('password');
    if (missing.length) {
        throw new Error(`Thiếu trường: ${missing.join(', ')}`);
    }

    // Kiểm tra username tồn tại
    const existing = await User.findOne({ username });
    if (existing) {
        throw new Error('Username đã tồn tại');
    }

    // Role chỉ cho phép các giá trị hợp lệ, mặc định 'student'
    const allowedRoles = ['student', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ fullname, username, passwordHash: hash, role: userRole, email, level, avatarUrl });
    await user.save();

    // Ghi log admin action
    await AdminLog.create({ adminId, action: 'create_user', meta: { id: user._id, role: user.role } });

    return {
        message: 'Tạo user thành công',
        user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            email: user.email
        }
    };
};

const getUsers = async (filters) => {
    const { page = 1, limit, role, search, level } = filters;

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

    const total = await User.countDocuments(filter);
    let query = User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 });

    if (limit && !isNaN(parseInt(limit))) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        query = query.skip(skip).limit(limitNum);
    }

    const users = await query;

    return {
        total,
        page: parseInt(page) || 1,
        limit: limit ? parseInt(limit) : total,
        totalPages: limit ? Math.ceil(total / parseInt(limit)) : 1,
        data: users
    };
};

const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }
    return user;
};

const updateUser = async (userId, updateData, adminId) => {
    const { fullname, username, email, role, level, xp, gems, avatarUrl } = updateData;

    // Kiểm tra user tồn tại
    const existingUser = await User.findById(userId);
    if (!existingUser) {
        throw new Error('Không tìm thấy người dùng');
    }

    // Kiểm tra username trùng (trừ chính user đang được update)
    if (username && username !== existingUser.username) {
        const usernameExists = await User.findOne({
            username,
            _id: { $ne: userId }
        });
        if (usernameExists) {
            throw new Error('Username đã tồn tại');
        }
    }

    const dataToUpdate = {
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
        userId,
        dataToUpdate,
        { new: true }
    ).select('-passwordHash');

    // Ghi log admin action
    await AdminLog.create({
        adminId,
        action: 'update_user',
        meta: {
            userId,
            updates: Object.keys(dataToUpdate)
        }
    });

    return updatedUser;
};

const resetPassword = async (userId, newPassword, adminId) => {
    if (!newPassword) {
        throw new Error('Vui lòng cung cấp mật khẩu mới');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    // Hash password mới
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = newPasswordHash;
    await user.save();

    // Ghi log admin action
    await AdminLog.create({
        adminId,
        action: 'reset_user_password',
        meta: { userId }
    });

    return { message: 'Đã reset mật khẩu thành công' };
};

const deleteUser = async (userId, adminId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    // Không cho phép xóa chính mình
    if (user._id.toString() === adminId) {
        throw new Error('Không thể xóa tài khoản của chính mình');
    }

    await User.findByIdAndDelete(userId);

    // Ghi log admin action
    await AdminLog.create({
        adminId,
        action: 'delete_user',
        meta: {
            deletedUserId: userId,
            deletedUsername: user.username
        }
    });

    return { message: 'Đã xóa người dùng thành công' };
};

const getUsersStats = async () => {
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
        .select('username fullname role level createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

    return {
        totalUsers,
        studentsCount,
        adminsCount,
        levelStats,
        recentUsers
    };
};

const updateProfile = async (userId, profileData) => {
    const { fullname, email, level, avatarUrl } = profileData;

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    // Chỉ cho phép update các field không nhạy cảm
    const updateData = {
        ...(fullname && { fullname }),
        ...(email && { email }),
        ...(level && { level }),
        ...(avatarUrl && { avatarUrl })
    };

    // Upload avatar mới nếu có


    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
    ).select('-passwordHash');

    return {
        message: 'Cập nhật thông tin thành công',
        user: updatedUser
    };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
        throw new Error('Vui lòng cung cấp đầy đủ mật khẩu hiện tại và mật khẩu mới');
    }

    // Lấy user từ database
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
        throw new Error('Mật khẩu hiện tại không đúng');
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu
    user.passwordHash = newPasswordHash;
    await user.save();

    return { message: 'Đổi mật khẩu thành công' };
};

const getProfile = async (userId) => {
    const user = await User.findById(userId)
        .select('-passwordHash');

    // Lấy thêm thông tin streak nếu có
    const streak = await Streak.findOne({ userId });

    return {
        ...user.toObject(),
        streak: streak || { current: 0, longest: 0 }
    };
};

const getNewUsersStats = async () => {
    const days = 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // 1. Dùng Aggregate để gom nhóm theo ngày
    const stats = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // 2. Xử lý lấp đầy các ngày không có dữ liệu
    const result = [];
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const dateString = d.toISOString().split('T')[0];

        const foundData = stats.find(item => item._id === dateString);

        result.push({
            date: dateString,
            count: foundData ? foundData.count : 0
        });
    }

    return result;
};

module.exports = {
    addUser,
    getUsers,
    getUserById,
    updateUser,
    resetPassword,
    deleteUser,
    getUsersStats,
    updateProfile,
    changePassword,
    getProfile,
    getNewUsersStats
};

