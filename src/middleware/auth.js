const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

const parseTokenFromCookie = (req) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';').map(p => p.trim());
    const tokenPart = parts.find(p => p.startsWith('token='));
    if (!tokenPart) return null;
    return decodeURIComponent(tokenPart.split('=')[1]);
};

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        token = parseTokenFromCookie(req);
    }

    if (!token) return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

module.exports = authMiddleware;

