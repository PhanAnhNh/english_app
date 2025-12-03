const mongoose = require('mongoose');

const GrammarSchema = new mongoose.Schema({
    title: { type: String, required: true },
    level: String,
    structure: String,
    content: String,
    example: String,
    isPublished: { type: Boolean, default: false },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'grammar_categories' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('grammars', GrammarSchema);

