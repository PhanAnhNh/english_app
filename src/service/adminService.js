const AdminLog = require('../model/AdminLog');

const getAdminLogs = async (filters) => {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const total = await AdminLog.countDocuments();
    const data = await AdminLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    return { total, page, limit, totalPages: Math.ceil(total / limit), data };
};

module.exports = {
    getAdminLogs
};

