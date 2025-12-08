const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'topics' },
    title: String,
    content: String,
    order: { type: Number, default: 0 },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'exercises' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('lessons', LessonSchema);

