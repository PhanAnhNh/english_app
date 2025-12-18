require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function test() {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    try {
        console.log('--- Testing with config { maxOutputTokens: 20 } ---');
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash-latest",
            contents: "Hãy viết một đoạn văn dài về con chuột hamster.",
            config: {
                maxOutputTokens: 20
            }
        });
        console.log('Response:', response.text);
        console.log('Length:', response.text.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
