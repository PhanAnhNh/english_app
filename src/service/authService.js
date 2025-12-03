const bcrypt = require('bcrypt');
const User = require('../model/User');
const { createToken } = require('../utils/jwt');

const register = async (userData) => {
    const { fullname, username, password, role = 'student', email } = userData;
    
    if (!username || !password) {
        throw new Error('Thiếu username hoặc password');
    }

    const existing = await User.findOne({ username });
    if (existing) {
        throw new Error('Username đã tồn tại');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Tạo user mới
    const user = new User({
        fullname,
        username,
        passwordHash: hash,
        role,
        email: email || null
    });
    await user.save();

    // Tạo token
    const token = createToken({
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role
    });

    return {
        message: 'Đăng ký thành công',
        user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            email: user.email
        },
        token
    };
};

const login = async (username, password) => {
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new Error('Sai username hoặc password');
    }

    const token = createToken({
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role
    });

    return {
        message: 'Đăng nhập thành công',
        user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role
        },
        token
    };
};

const adminLogin = async (username, password) => {
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new Error('Sai username hoặc password');
    }

    // Chỉ cho phép admin
    if (user.role !== 'admin') {
        throw new Error('Chỉ Admin được phép đăng nhập vào web admin');
    }

    const token = createToken({
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role
    });

    return {
        message: 'Đăng nhập admin thành công',
        user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role
        },
        token
    };
};

const getMe = async (userId) => {
    const user = await User.findById(userId).select('-passwordHash');
    return user;
};

module.exports = {
    register,
    login,
    adminLogin,
    getMe
};

