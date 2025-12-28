const authService = require('../service/authService');

const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE) || 30 * 24 * 60 * 60 * 1000; // 30 days default

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'false' ? false : process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' cho cross-domain trong production
    maxAge: COOKIE_MAX_AGE,
    ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }) // Optional: set domain nếu cần
});

// Helper để lấy device info từ request
const getDeviceInfo = (req) => {
    return {
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
        deviceType: req.body.deviceType || 'mobile'
    };
};

// Register - trả về tokens cho Flutter app, không set cookie
const register = async (req, res) => {
    try {
        const deviceInfo = getDeviceInfo(req);
        const result = await authService.register({ ...req.body, deviceInfo });
        // Không set cookie, chỉ trả về tokens trong response body cho Flutter app
        res.json({
            message: result.message,
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

// Login cho Flutter app - chỉ trả về tokens, KHÔNG set cookie
const login = async (req, res) => {
    try {
        const { username, password, logoutOthers } = req.body;
        const deviceInfo = getDeviceInfo(req);

        // Chỉ truyền nếu có giá trị, nếu không để service tự default là true
        const logoutOthersFlag = logoutOthers !== undefined ? (logoutOthers === true || logoutOthers === 'true') : undefined;
        const result = await authService.login(username, password, deviceInfo, logoutOthersFlag);
        // Không set cookie, chỉ trả về tokens trong response body cho Flutter app
        res.json({
            message: result.message,
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

// Login cho Web Admin - set cookies cho cả access và refresh token
const adminLogin = async (req, res) => {
    try {
        const { username, password, logoutOthers } = req.body;
        const deviceInfo = getDeviceInfo(req);
        deviceInfo.deviceType = 'web'; // Force web type for admin

        // Chỉ truyền nếu có giá trị, nếu không để service tự default là true
        const logoutOthersFlag = logoutOthers !== undefined ? (logoutOthers === true || logoutOthers === 'true') : undefined;
        const result = await authService.adminLogin(username, password, deviceInfo, logoutOthersFlag);

        // Set cookies cho web admin (HttpOnly, Secure)
        if (result && result.accessToken) {
            res.cookie('accessToken', result.accessToken, cookieOptions());
        }
        if (result && result.refreshToken) {
            res.cookie('refreshToken', result.refreshToken, cookieOptions());
        }

        // Không trả về tokens trong body để bảo mật
        res.json({
            message: result.message,
            user: result.user
            // Không trả về tokens để tránh lộ token trong response
        });
    } catch (e) {
        const statusCode = e.message.includes('Chỉ Admin') ? 403 : 400;
        res.status(statusCode).json({ message: e.message });
    }
};

// Refresh access token
const refreshToken = async (req, res) => {
    try {
        let refreshTokenString = null;

        // Kiểm tra refresh token từ cookie (web admin) hoặc body (Flutter app)
        if (req.cookies && req.cookies.refreshToken) {
            refreshTokenString = req.cookies.refreshToken;
        } else if (req.body.refreshToken) {
            refreshTokenString = req.body.refreshToken;
        } else {
            return res.status(400).json({ message: 'Thiếu refresh token' });
        }

        const result = await authService.refreshAccessToken(refreshTokenString);

        // Nếu là web admin (có cookie), set lại access token cookie
        if (req.cookies && req.cookies.refreshToken) {
            res.cookie('accessToken', result.accessToken, cookieOptions());
        }

        res.json({
            accessToken: result.accessToken,
            user: result.user
        });
    } catch (e) {
        res.status(401).json({ message: e.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await authService.getMe(req.user.id);
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Logout - revoke refresh token
const logout = async (req, res) => {
    try {
        let refreshTokenString = null;

        // Lấy refresh token từ cookie hoặc body
        if (req.cookies && req.cookies.refreshToken) {
            refreshTokenString = req.cookies.refreshToken;
        } else if (req.body.refreshToken) {
            refreshTokenString = req.body.refreshToken;
        }

        if (refreshTokenString) {
            await authService.revokeRefreshToken(refreshTokenString, req.user.id);
        }

        // Clear cookies cho web admin
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.json({ message: 'Đã đăng xuất thành công' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Logout tất cả thiết bị
const logoutAll = async (req, res) => {
    try {
        await authService.revokeAllUserTokens(req.user.id);

        // Clear cookies
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.json({ message: 'Đã đăng xuất tất cả thiết bị' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { username } = req.body;
        const result = await authService.forgotPassword(username);
        res.json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { username, otp } = req.body;
        const result = await authService.verifyOtp(username, otp);
        res.json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { username, otp, newPassword } = req.body;
        const result = await authService.resetPassword(username, otp, newPassword);
        res.json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

module.exports = {
    register,
    login,
    adminLogin,
    refreshToken,
    getMe,
    logout,
    logoutAll,
    forgotPassword,
    verifyOtp,
    resetPassword
};
