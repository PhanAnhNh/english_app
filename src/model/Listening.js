const mongoose = require('mongoose');

const ListeningSchema = new mongoose.Schema({
    title: String,
    audioUrl: { type: String, required: true },
    transcript: String,
    level: String,
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'topics', // Phải khớp với tên model bạn đã đặt: mongoose.model('topics', ...)
        required: true
    },
    duration: Number, // thời lượng audio (giây)
    questions: [{
        questionText: String,
        startTime: Number, // thời điểm bắt đầu câu hỏi trong audio
        options: [String],
        correctAnswer: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('listenings', ListeningSchema);

