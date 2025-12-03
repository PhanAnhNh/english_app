const adminService = require('../service/adminService');

const getAdminLogs = async (req, res) => {
    try {
        const result = await adminService.getAdminLogs(req.query);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getAdminLogs
};
