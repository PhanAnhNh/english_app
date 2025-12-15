const mongoose = require('mongoose');

const grammarExerciseSchema = new mongoose.Schema({
    grammarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'grammars', // Liên kết với Collection Grammar (bài học cụ thể như Present Simple)
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String, // Mảng các đáp án: ["go", "goes", "going", "went"]
        required: true
    }],
    correctAnswer: {
        type: String, // Đáp án đúng: "goes"
        required: true
    },
    explanation: {
        type: String, // Giải thích tại sao đúng (tùy chọn)
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('GrammarExercise', grammarExerciseSchema);