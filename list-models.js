require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function test() {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    try {
        console.log('--- Listing Models ---');
        const models = await ai.models.list();
        console.log(JSON.stringify(models, null, 2));
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

test();
