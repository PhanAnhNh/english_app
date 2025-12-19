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

        // Lấy cấu hình tính cách từ DB
        const config = await ChatbotConfig.findOne({ isActive: true }) || {
            personality: "Bạn là Bee-Bot (chuột hamster Beelingual).",
            maxTokens: 200
        };

        console.log('Using MaxTokens:', config.maxTokens);

        // Tạo một "Kho kiến thức" từ tất cả các câu hỏi gợi ý có câu trả lời
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

        // Danh sách các model Gemma 3 để fallback
        const gemmaModels = [
            "gemma-3-27b-it",
            "gemma-3-12b-it",
            "gemma-3-4b-it",
            "gemma-3n-e4b-it",
            "gemma-3n-e2b-it",
            "gemma-3-1b-it"
        ];

        let responseText = "";
        let usedModel = "";
        let lastError = null;

        // Thử từng model trong danh sách
        for (const modelName of gemmaModels) {
            try {
                console.log(`Attempting to use model: ${modelName}...`);
                const prompt = `
### SYSTEM INSTRUCTIONS
Tính cách và vai trò của bạn: ${config.personality}
Ngôn ngữ phản hồi: Tiếng Việt.

### KNOWLEDGE BASE
${knowledgeBase || "Bạn là một trợ lý thông minh, hãy sử dụng kiến thức chung để trả lời."}

### USER CONTEXT
Người dùng đang trò chuyện với bạn qua ứng dụng học tiếng Anh Beelingual.

### QUESTION
${message}

### RESPONSE GUIDELINES
- Trả lời ngắn gọn, súc tích (dưới 100 từ).
- Tuyệt đối tuân thủ tính cách đã được mô tả ở trên trong mọi câu trả lời.
- Nếu không biết thông tin, hãy trả lời dựa trên tính cách nhân vật (đừng chỉ nói "tôi không biết" một cách máy móc).
`.trim();

                const result = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                    ]
                });

                responseText = result.text;
                usedModel = modelName;
                console.log(`Success with model: ${modelName}`);
                break; // Thành công thì thoát vòng lặp
            } catch (error) {
                console.error(`Model ${modelName} failed:`, error.message);
                lastError = error;
                // Tiếp tục vòng lặp sang model tiếp theo
            }
        }

        if (!responseText && lastError) {
            throw lastError; // Nếu tất cả model đều xịt thì quăng lỗi ra ngoài
        }

        // Lấy text trả về an toàn
        const replyText = responseText || "Cụ bị Google 'xích' rồi, không nói được câu này đâu sen ơi... (Safety Block)";
        console.log(`AI Response (${usedModel}):`, replyText);

        res.json({
            success: true,
            reply: replyText
        });

    } catch (error) {
        console.error('--- Gemini Error Details ---');
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.dir(error, { depth: null });

        // Lấy cấu hình lỗi từ DB
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
            // Tạo default nếu chưa có
            config = await ChatbotConfig.create({
                botName: 'Bee-Bot',
                personality: 'Bạn là Bee-Bot.',
                welcomeMessage: 'Chào con sen! Cụ Bee-Bot đây. Hôm nay định lười học tiếng Anh hay gì mà tìm cụ?',
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
