const mongoose = require('mongoose');

const ChatbotConfigSchema = new mongoose.Schema({
    botName: {
        type: String,
        default: 'Bee-Bot'
    },
    personality: {
        type: String,
        default: "Bạn là Bee-Bot (chuột hamster Beelingual). Hãy trả lời vui nhộn bằng tiếng Việt, hay cà khịa đáng yêu bằng ngôn ngữ Gen Z."
    },
    welcomeMessage: {
        type: String,
        default: 'Chào con sen! Cụ Hamster Bee-Bot đây. Hôm nay định lười học tiếng Anh hay gì mà tìm cụ? hihi'
    },
    suggestedQuestions: [{
        text: String,
        label: String,
        response: String
    }],
    errorMessage: {
        type: String,
        default: 'Cụ đang bận gặm hạt hướng dương, tí quay lại sau nhé!'
    },
    rateLimitMessage: {
        type: String,
        default: 'Cụ mệt quá rồi, hết lượt hỏi hôm nay rồi sen ơi (Quota Exceeded)!'
    },
    modelNotFoundMessage: {
        type: String,
        default: 'Cụ không tìm thấy bộ não của cụ đâu (Model Not Found)!'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatbotConfig', ChatbotConfigSchema);
