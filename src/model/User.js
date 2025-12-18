const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'student', enum: ['student', 'admin'] },
    email: { type: String, index: true },
    level: { type: String, default: 'A' },
    fullname: { type: String, required: true },
    avatarUrl: String,

    // Gamification
    xp: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },

    // Password Reset
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date },

    tokenVersion: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('users', UserSchema);

