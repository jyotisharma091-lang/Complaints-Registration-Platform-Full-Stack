const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // The SDK might not have a direct listModels method on genAI in all versions
        // but let's try to see if we can find it.
        // Actually, we can use the fetch API to call the listModels endpoint if needed.
        console.log('Checking SDK for listModels...');
        // In newer SDKs, it might be different.
        // Let's just try a few common model names.
        const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
        
        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("test");
                console.log(`Model ${modelName} is available.`);
            } catch (e) {
                console.log(`Model ${modelName} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
