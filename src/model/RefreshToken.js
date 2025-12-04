const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true,
        index: true
    },
    token: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    deviceInfo: {
        userAgent: String,
        ipAddress: String,
        deviceType: String // 'web', 'mobile', 'tablet'
    },
    expiresAt: { 
        type: Date, 
        required: true,
        index: { expireAfterSeconds: 0 } // Tự động xóa khi hết hạn
    },
    isRevoked: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Index để tìm token nhanh
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ token: 1, isRevoked: 1 });

module.exports = mongoose.model('refresh_tokens', RefreshTokenSchema);

