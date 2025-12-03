const authService = require('../service/authService');

const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE) || 30 * 24 * 60 * 60 * 1000; // 30 days default

const cookieOptions = () => ({
    httpOnly: true,
    // Allow overriding secure flag for local development by setting COOKIE_SECURE=false
    secure: process.env.COOKIE_SECURE === 'false' ? false : process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE
});

const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        // Set HttpOnly cookie with token and do not expose token in response
        if (result && result.token) {
            res.cookie('token', result.token, cookieOptions());
        }
        res.json({ message: result.message, user: result.user });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        if (result && result.token) {
            res.cookie('token', result.token, cookieOptions());
        }
        res.json({ message: result.message, user: result.user });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authService.adminLogin(username, password);
        if (result && result.token) {
            res.cookie('token', result.token, cookieOptions());
        }
        res.json({ message: result.message, user: result.user });
    } catch (e) {
        const statusCode = e.message.includes('Chỉ Admin') ? 403 : 400;
        res.status(statusCode).json({ message: e.message });
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

const logout = async (req, res) => {
    // Clear the token cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ message: 'Đã đăng xuất' });
};

module.exports = {
    register,
    login,
    adminLogin,
    getMe,
    logout
};

