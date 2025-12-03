const mongoose = require('mongoose');

const GrammarCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    icon: String,
    order: { type: Number, default: 0 },
    level: { type: String, enum: ['A', 'B', 'C'], default: 'A' },
    isActive: { type: Boolean, default: true },
    parentCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'grammar_categories' }, // Danh mục cha (cho cây phân cấp)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('grammar_categories', GrammarCategorySchema);

