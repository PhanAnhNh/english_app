const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'topics' },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'lessons' },
    completed: { type: Boolean, default: false },
    score: Number,
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('progress', ProgressSchema);

