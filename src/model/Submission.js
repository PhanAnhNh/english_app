const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'exercises' },
    type: String,
    score: Number,
    userAnswer: String,
    teacherFeedback: String,
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('submissions', SubmissionSchema);

