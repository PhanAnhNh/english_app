const mongoose = require('mongoose');

const ListeningSchema = new mongoose.Schema({
    title: String,
    audioUrl: { type: String, required: true },
    cloudinaryAudioId: String,
    transcript: String,
    level: String,
    topic: String,
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

