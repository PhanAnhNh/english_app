const userService = require('../service/userService');

const addUser = async (req, res) => {
    try {
        const result = await userService.addUser(req.body, req.user.id);
        res.json(result);
    } catch (e) {
        const statusCode = e.message.includes('Thiếu') ? 400 : (e.message.includes('tồn tại') ? 400 : 500);
        res.status(statusCode).json({ message: e.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const result = await userService.getUsers(req.query);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json(user);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body, req.user.id);
        res.json(updatedUser);
    } catch (e) {
        const statusCode = e.message.includes('tìm thấy') ? 404 : (e.message.includes('tồn tại') ? 400 : 500);
        res.status(statusCode).json({ message: e.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const result = await userService.resetPassword(req.params.id, newPassword, req.user.id);
        res.json(result);
    } catch (e) {
        const statusCode = e.message.includes('tìm thấy') ? 404 : 400;
        res.status(statusCode).json({ message: e.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const result = await userService.deleteUser(req.params.id, req.user.id);
        res.json(result);
    } catch (e) {
        const statusCode = e.message.includes('tìm thấy') ? 404 : (e.message.includes('xóa') ? 400 : 500);
        res.status(statusCode).json({ message: e.message });
    }
};

const getUsersStats = async (req, res) => {
    try {
        const result = await userService.getUsersStats();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const result = await userService.updateProfile(req.user.id, req.body, req.files);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
        res.json(result);
    } catch (e) {
        const statusCode = e.message.includes('đầy đủ') || e.message.includes('không đúng') ? 400 : 404;
        res.status(statusCode).json({ message: e.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const result = await userService.getProfile(req.user.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getNewUsersStats = async (req, res) => {
    try {
        const result = await userService.getNewUsersStats();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
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
