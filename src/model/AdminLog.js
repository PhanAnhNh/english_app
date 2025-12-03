const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    action: String,
    meta: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('admin_logs', AdminLogSchema);

