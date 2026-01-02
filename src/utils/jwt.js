const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = require('../config/constants');

// Tạo Access Token (ngắn hạn - 15 phút đến 1 giờ)
const createAccessToken = (payload, expiresIn = null) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: expiresIn || JWT_EXPIRES_IN || '15m' // Mặc định 15 phút
    });
};

// Tạo Refresh Token (dài hạn - 7 đến 30 ngày)
const createRefreshToken = (payload, expiresIn = null) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: expiresIn || JWT_REFRESH_EXPIRES_IN || '7d' // Dùng tham số truyền vào hoặc mặc định
    });
};

// Verify Access Token
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Access token không hợp lệ hoặc đã hết hạn');
    }
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    }
};

module.exports = {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
