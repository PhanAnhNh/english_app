const mongoose = require('mongoose');

const LandingPageContentSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        enum: ['hero', 'features', 'statistics', 'download', 'footer'],
        unique: true
    },
    content: {
        // Hero Section
        heroTitle: String,
        heroSubtitle: String,
        heroImageUrl: String,
        heroCtaText: String,

        // Features Section (array of features)
        features: [{
            title: String,
            description: String,
            imageUrl: String,
            icon: String
        }],

        // Statistics Section
        stats: {
            totalUsers: Number,
            totalLessons: Number,
            totalVocabulary: Number,
            totalGrammar: Number
        },

        // Download Section
        downloadTitle: String,
        downloadDescription: String,
        iosLink: String,
        androidLink: String,
        apkLink: String,

        // Footer Section
        footerDescription: String,
        socialLinks: {
            facebook: String,
            instagram: String,
            twitter: String,
            youtube: String
        },
        contactEmail: String,
        contactPhone: String
    },
    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('landing_page_contents', LandingPageContentSchema);
