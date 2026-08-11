const { ConfigService } = require('@nestjs/config');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testDirectProvider() {
  console.log('--- DIRECT AI PROVIDER TEST ---');
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const provider = (process.env.AI_PROVIDER || 'GEMINI').toUpperCase();
  const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';

  console.log('Provider:', provider);
  console.log('Model:', modelName);
  console.log('API Key Status:', apiKey ? (apiKey.includes('mock') ? 'PRESENT (MOCK KEY)' : 'PRESENT (REAL KEY)') : 'MISSING');

  if (!apiKey || apiKey.includes('mock')) {
    console.log('RESULT: Provider configured with mock/placeholder key. Graceful fallback mode is active.');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hello, respond with one short sentence.');
    const responseText = result.response.text();
    console.log('PROVIDER DIRECT RESPONSE:', responseText);
    console.log('RESULT: SUCCESS');
  } catch (err) {
    console.error('PROVIDER DIRECT ERROR:', err.message);
    console.log('RESULT: PROVIDER ERROR (Handled by AiService categorized error logger)');
  }
}

testDirectProvider();
