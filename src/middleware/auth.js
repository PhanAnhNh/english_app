const { verifyAccessToken } = require('../utils/jwt');

const parseTokenFromCookie = (req) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';').map(p => p.trim());
    const tokenPart = parts.find(p => p.startsWith('accessToken='));
    if (!tokenPart) return null;
    return decodeURIComponent(tokenPart.split('=')[1]);
};

const authMiddleware = async (req, res, next) => {
    let token = null;

    // Ưu tiên kiểm tra Bearer token (Flutter app)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        // Nếu không có Bearer token, kiểm tra cookie (web admin)
        token = parseTokenFromCookie(req);
    }

    if (!token) {
        return res.status(401).json({
            message: 'Không có token, vui lòng đăng nhập.',
            code: 'NO_TOKEN'
        });
    }

    try {
        const decoded = verifyAccessToken(token);

        // Kiểm tra Token Version để hỗ trợ Instant Logout
        const User = require('../model/User');
        const user = await User.findById(decoded.id).select('tokenVersion');

        if (!user) {
            return res.status(401).json({
                message: 'Người dùng không tồn tại.',
                code: 'USER_NOT_FOUND'
            });
        }

        if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({
                message: 'Phiên làm việc đã hết hạn do đăng nhập ở thiết bị khác.',
                code: 'SESSION_EXPIRED'
            });
        }

        req.user = decoded;
        next();
    } catch (e) {
        // Nếu access token hết hạn, trả về code đặc biệt để client biết cần refresh
        if (e.message.includes('hết hạn') || e.message.includes('expired')) {
            return res.status(401).json({
                message: 'Access token đã hết hạn, vui lòng refresh token.',
                code: 'TOKEN_EXPIRED'
            });
        }
        return res.status(401).json({
            message: 'Token không hợp lệ.',
            code: 'INVALID_TOKEN'
        });
    }
};

module.exports = authMiddleware;
