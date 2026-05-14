const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

async function testGemini() {
    try {
        const complaint_text = "I have a problem with my electricity bill. It is too high.";
        const prompt = `You are a helpful assistant for a complaint registration portal. 
        The user submitted this complaint: "${complaint_text}". 
        Ask exactly one short follow-up question to help understand the situation better. 
        Return only the question text.`;

        console.log('Sending prompt to Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        console.log('Gemini Response:', text);
    } catch (error) {
        console.error('Gemini error:', error);
    }
}

testGemini();
