const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

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

module.exports = authMiddleware;

