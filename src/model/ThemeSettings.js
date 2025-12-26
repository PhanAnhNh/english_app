const mongoose = require('mongoose');

const ThemeSettingsSchema = new mongoose.Schema({
    primaryColor: { type: String, default: '#ffc107' },
    secondaryColor: { type: String, default: '#1a1d29' },
    accentColor: { type: String, default: '#ffdb4d' },
    backgroundColor: { type: String, default: '#0f1117' },
    textColor: { type: String, default: '#ffffff' },

    // New granular colors
    footerColor: { type: String, default: '#0f1117' },
    heroHeadlineColor: { type: String, default: '#ffc107' },
    cardColor: { type: String, default: '#1a1d29' },
    inputBackgroundColor: { type: String, default: '#ffffff' },
    successColor: { type: String, default: '#28a745' },
    errorColor: { type: String, default: '#dc3545' },

    // Chatbot specific colors
    chatWindowColor: { type: String, default: '#ffffff' },
    chatHeaderTextColor: { type: String, default: '#1a1d29' },
    botBubbleColor: { type: String, default: '#ffffff' },
    botTextColor: { type: String, default: '#333333' },
    userBubbleColor: { type: String, default: '#1a1d29' },
    userTextColor: { type: String, default: '#ffffff' },
    suggestedBgColor: { type: String, default: '#ffffff' },
    suggestedTextColor: { type: String, default: '#1a1d29' },

    // Gradient colors
    gradientStart: { type: String, default: '#ffc107' },
    gradientEnd: { type: String, default: '#ffdb4d' },

    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('theme_settings', ThemeSettingsSchema);
