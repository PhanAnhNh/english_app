const mongoose = require('mongoose');

const ThemeSettingsSchema = new mongoose.Schema({
    primaryColor: { type: String, default: '#ffc107' }, // Golden yellow
    secondaryColor: { type: String, default: '#1a1d29' }, // Dark navy
    accentColor: { type: String, default: '#ffdb4d' }, // Light yellow
    backgroundColor: { type: String, default: '#0f1117' }, // Very dark
    textColor: { type: String, default: '#ffffff' },

    // Gradient colors
    gradientStart: { type: String, default: '#ffc107' },
    gradientEnd: { type: String, default: '#ffdb4d' },

    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('theme_settings', ThemeSettingsSchema);
