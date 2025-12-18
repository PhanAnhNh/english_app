const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../model/User');
const RefreshToken = require('../model/RefreshToken');
const { createAccessToken, createRefreshToken } = require('../utils/jwt');
const emailService = require('./emailService');

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

    // Tạo tokens
    const accessToken = createAccessToken({
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role
    });

    const refreshToken = createRefreshToken({
        id: user._id,
        username: user.username
    });

    // Lưu refresh token vào database
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 ngày

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: refreshTokenExpires,
        deviceInfo: userData.deviceInfo || {}
    });

    return {
        message: 'Đăng ký thành công',
        user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            email: user.email,
            tokenVersion: user.tokenVersion
        },
        accessToken,
        refreshToken
    };
};

const login = async (username, password, deviceInfo = {}, logoutOthers = true) => {
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new Error('Sai username hoặc password');
    }

    // Nếu yêu cầu đăng xuất các thiết bị khác
    if (logoutOthers) {
        await RefreshToken.updateMany(
            { userId: user._id, isRevoked: false },
            { isRevoked: true }
        );
        // Tăng token version để đá máy cũ (Instant Logout)
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
    }

    // Tạo tokens
    const accessToken = createAccessToken({
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
        tokenVersion: user.tokenVersion // Gắn version vào token
    });

    const refreshToken = createRefreshToken({
        id: user._id,
        username: user.username
    });

    // Lưu refresh token vào database
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 ngày

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: refreshTokenExpires,
        deviceInfo: {
            userAgent: deviceInfo.userAgent,
            ipAddress: deviceInfo.ipAddress,
            deviceType: deviceInfo.deviceType || 'mobile'
        }
    });

    return {
        message: 'Đăng nhập thành công',
        user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            tokenVersion: user.tokenVersion
        },
        accessToken,
        refreshToken
    };
};

const adminLogin = async (username, password, deviceInfo = {}, logoutOthers = true) => {
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new Error('Sai username hoặc password');
    }

    // Nếu yêu cầu đăng xuất các thiết bị khác
    if (logoutOthers) {
        await RefreshToken.updateMany(
            { userId: user._id, isRevoked: false },
            { isRevoked: true }
        );
        // Tăng token version để đá máy cũ (Instant Logout)
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
    }

    // Tạo tokens
    const accessToken = createAccessToken({
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
        tokenVersion: user.tokenVersion // Gắn version vào token
    });

    const refreshToken = createRefreshToken({
        id: user._id,
        username: user.username
    });

    // Lưu refresh token vào database
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 ngày

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: refreshTokenExpires,
        deviceInfo: {
            userAgent: deviceInfo.userAgent,
            ipAddress: deviceInfo.ipAddress,
            deviceType: deviceInfo.deviceType || 'web'
        }
    });

    return {
        message: 'Đăng nhập admin thành công',
        user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            tokenVersion: user.tokenVersion
        },
        accessToken,
        refreshToken
    };
};

const refreshAccessToken = async (refreshTokenString) => {
    // Verify refresh token
    const { verifyRefreshToken } = require('../utils/jwt');
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshTokenString);
    } catch (error) {
        throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Kiểm tra refresh token trong database
    const refreshTokenDoc = await RefreshToken.findOne({
        token: refreshTokenString,
        userId: decoded.id,
        isRevoked: false
    });

    if (!refreshTokenDoc) {
        throw new Error('Refresh token không tồn tại hoặc đã bị thu hồi');
    }

    // Kiểm tra token đã hết hạn chưa
    if (refreshTokenDoc.expiresAt < new Date()) {
        await RefreshToken.findByIdAndUpdate(refreshTokenDoc._id, { isRevoked: true });
        throw new Error('Refresh token đã hết hạn');
    }

    // Lấy thông tin user
    const user = await User.findById(decoded.id);
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }

    // Tạo access token mới
    const newAccessToken = createAccessToken({
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
        tokenVersion: user.tokenVersion // Cập nhật version mới nhất
    });

    return {
        accessToken: newAccessToken,
        user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            tokenVersion: user.tokenVersion
        }
    };
};

const revokeRefreshToken = async (refreshTokenString, userId) => {
    const refreshToken = await RefreshToken.findOne({
        token: refreshTokenString,
        userId: userId
    });

    if (refreshToken) {
        refreshToken.isRevoked = true;
        await refreshToken.save();
    }

    return { message: 'Đã đăng xuất thành công' };
};

const revokeAllUserTokens = async (userId) => {
    await RefreshToken.updateMany(
        { userId, isRevoked: false },
        { isRevoked: true }
    );

    return { message: 'Đã đăng xuất tất cả thiết bị' };
};

const getMe = async (userId) => {
    const user = await User.findById(userId).select('-passwordHash');
    return user;
};

const forgotPassword = async (username) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('Username không tồn tại trong hệ thống');
    }
    if (!user.email) {
        throw new Error('Tài khoản này chưa đăng ký email, vui lòng liên hệ admin');
    }

    const email = user.email;

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP và thời gian hết hạn (10 phút)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Gửi email
    await emailService.sendOtpEmail(email, otp);

    return { message: 'Mã OTP đã được gửi đến email của bạn' };
};

const verifyOtp = async (username, otp) => {
    const user = await User.findOne({
        username,
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    return { message: 'Xác thực OTP thành công' };
};

const resetPassword = async (username, otp, newPassword) => {
    // Verify lại một lần nữa để chắc chắn
    const user = await User.findOne({
        username,
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // Hash password mới
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Cập nhật password và xóa OTP
    user.passwordHash = hash;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Đặt lại mật khẩu thành công' };
};

module.exports = {
    register,
    login,
    adminLogin,
    refreshAccessToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    getMe,
    forgotPassword,
    verifyOtp,
    resetPassword
};
