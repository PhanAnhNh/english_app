const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    level: String,
    imageUrl: String,
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Topic', TopicSchema);

