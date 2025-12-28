const LandingPageContent = require('../model/LandingPageContent');
const ThemeSettings = require('../model/ThemeSettings');
const User = require('../model/User');
const Lesson = require('../model/Lesson');
const Vocabulary = require('../model/Vocabulary');
const Grammar = require('../model/Grammar');
const Topic = require('../model/Topic');

// Get all landing page content
exports.getLandingPageContent = async (req, res) => {
    try {
        const content = await LandingPageContent.find({ isActive: true });

        // Transform to easier format for frontend
        const formattedContent = {};
        content.forEach(item => {
            formattedContent[item.section] = item.content;
        });

        res.json({
            success: true,
            data: formattedContent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching landing page content',
            error: error.message
        });
    }
};

// Get real-time statistics
exports.getRealTimeStatistics = async (req, res) => {
    try {
        const [userCount, lessonCount, vocabularyCount, grammarCount, topicCount] = await Promise.all([
            User.countDocuments(),
            Lesson.countDocuments(),
            Vocabulary.countDocuments(),
            Grammar.countDocuments(),
            Topic.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                totalUsers: userCount,
                totalLessons: lessonCount,
                totalVocabulary: vocabularyCount,
                totalVocabulary: vocabularyCount,
                totalGrammar: grammarCount,
                totalTopics: topicCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

// Get theme settings
exports.getThemeSettings = async (req, res) => {
    try {
        let theme = await ThemeSettings.findOne({ isActive: true });

        // If no theme exists, create default one
        if (!theme) {
            theme = await ThemeSettings.create({
                primaryColor: '#ffc107',
                secondaryColor: '#1a1d29',
                accentColor: '#ffdb4d',
                backgroundColor: '#0f1117',
                textColor: '#ffffff',
                footerColor: '#0f1117',
                heroHeadlineColor: '#ffc107',
                cardColor: 'rgba(26, 29, 41, 0.7)',
                inputBackgroundColor: 'rgba(255, 255, 255, 0.05)',
                successColor: '#28a745',
                errorColor: '#dc3545',
                chatWindowColor: '#ffffff',
                botBubbleColor: '#ffffff',
                botTextColor: '#333333',
                userBubbleColor: '#1a1d29',
                userTextColor: '#ffffff',
                suggestedBgColor: '#ffffff',
                suggestedTextColor: '#1a1d29',
                gradientStart: '#ffc107',
                gradientEnd: '#ffdb4d',
                isActive: true
            });
        }

        res.json({
            success: true,
            data: theme
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching theme settings',
            error: error.message
        });
    }
};

// Update landing page content by section (ADMIN ONLY)
exports.updateLandingPageContent = async (req, res) => {
    try {
        const { section } = req.params;
        const { content } = req.body;

        const updated = await LandingPageContent.findOneAndUpdate(
            { section },
            { content, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: `Updated ${section} section successfully`,
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating landing page content',
            error: error.message
        });
    }
};

// Update theme settings (ADMIN ONLY)
exports.updateThemeSettings = async (req, res) => {
    try {
        const themeData = req.body;

        let theme = await ThemeSettings.findOne({ isActive: true });

        if (theme) {
            // Update existing theme
            Object.assign(theme, themeData);
            theme.updatedAt = Date.now();
            await theme.save();
        } else {
            // Create new theme
            theme = await ThemeSettings.create({
                ...themeData,
                isActive: true
            });
        }

        res.json({
            success: true,
            message: 'Theme settings updated successfully',
            data: theme
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating theme settings',
            error: error.message
        });
    }
};
