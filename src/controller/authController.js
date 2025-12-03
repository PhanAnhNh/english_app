const authService = require('../service/authService');

const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authService.adminLogin(username, password);
        res.json(result);
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

module.exports = {
    register,
    login,
    adminLogin,
    getMe
};
