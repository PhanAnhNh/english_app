const { GoogleGenAI } = require("@google/genai");
const ChatbotConfig = require('../model/ChatbotConfig');

// Controller xử lý Chatbot bằng Gemini
exports.chatWithHamster = async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Chatbot message received:', message);
        console.log('Gemini API Key present:', !!process.env.GEMINI_API_KEY);

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tin nhắn'
            });
        }

        // Lấy cấu hình tính cách từ DB hihi
        const config = await ChatbotConfig.findOne({ isActive: true }) || {
            personality: "Bạn là Bee-Bot (chuột hamster Beelingual). Hãy trả lời vui nhộn bằng tiếng Việt.",
            maxTokens: 200
        };

        console.log('Using MaxTokens:', config.maxTokens);

        // Tạo một "Kho kiến thức" từ tất cả các câu hỏi gợi ý có câu trả lời hihi
        let knowledgeBase = "";
        if (config.suggestedQuestions && config.suggestedQuestions.length > 0) {
            const facts = config.suggestedQuestions
                .filter(q => q.response)
                .map(q => `- Nếu được hỏi về "${q.text}": ${q.response}`)
                .join('\n');

            if (facts) {
                knowledgeBase = `\n\n[DỮ LIỆU KIẾN THỨC CỦA BẠN]:\n${facts}\n\n(Lưu ý: Nếu người dùng hỏi bất cứ điều gì LIÊN QUAN đến các thông tin trên, hãy ưu tiên sử dụng dữ liệu này để trả lời một cách tự nhiên nhất).`;
            }
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${config.personality}${knowledgeBase}\n\nCâu hỏi từ người dùng: ${message}`,
            safetySettings: [
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
        });

        // Lấy text trả về an toàn hihi
        const replyText = response?.text || "Cụ bị Google 'xích' rồi, không nói được câu này đâu sen ơi... (Safety Block hihi)";
        console.log('AI Response:', replyText);

        res.json({
            success: true,
            reply: replyText
        });

    } catch (error) {
        console.error('--- Gemini Error Details ---');
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.dir(error, { depth: null });

        // Lấy cấu hình lỗi từ DB hihi
        let config = await ChatbotConfig.findOne({ isActive: true });

        let errorMsg = config?.errorMessage || 'Cụ đang bận gặm hạt hướng dương, tí quay lại sau nhé!';

        if (error.status === 429) {
            errorMsg = config?.rateLimitMessage || 'Cụ mệt quá rồi, hết lượt hỏi hôm nay rồi sen ơi (Quota Exceeded)!';
        } else if (error.status === 404) {
            errorMsg = config?.modelNotFoundMessage || 'Cụ không tìm thấy bộ não của cụ đâu (Model Not Found)!';
        } else if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
            errorMsg = 'Cụ bị "xích" rồi vì nói năng linh tinh quá (Safety Block)!';
        }

        res.status(500).json({
            success: false,
            message: errorMsg,
            error: error.message
        });
    }
};

// Lấy cấu hình Chatbot (cho Landing Page)
exports.getChatConfig = async (req, res) => {
    try {
        let config = await ChatbotConfig.findOne({ isActive: true });

        if (!config) {
            // Tạo default nếu chưa có hihi
            config = await ChatbotConfig.create({
                botName: 'Bee-Bot',
                personality: 'Bạn là Bee-Bot (chuột hamster Beelingual).',
                welcomeMessage: 'Chào con sen! Cụ Hamster Bee-Bot đây. Hôm nay định lười học tiếng Anh hay gì mà tìm cụ? hihi',
                suggestedQuestions: [
                    {
                        text: 'App này có gì hay ?',
                        label: 'Khám phá app',
                        response: 'App này có hàng ngàn từ vựng, bài tập ngữ pháp và luyện nghe cực phẩm luôn nha sen!'
                    },
                ],
                errorMessage: 'Cụ đang bận gặm hạt hướng dương, tí quay lại sau nhé!',
                rateLimitMessage: 'Cụ mệt quá rồi, hết lượt hỏi hôm nay rồi sen ơi (Quota Exceeded)!',
                modelNotFoundMessage: 'Cụ không tìm thấy bộ não của cụ đâu (Model Not Found)!'
            });
        }

        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể lấy cấu hình chatbot',
            error: error.message
        });
    }
};

// Cập nhật cấu hình Chatbot (cho Admin)
exports.updateChatConfig = async (req, res) => {
    try {
        const configData = req.body;
        const config = await ChatbotConfig.findOneAndUpdate(
            { isActive: true },
            { ...configData, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật cấu hình chatbot thành công!',
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật cấu hình',
            error: error.message
        });
    }
};
