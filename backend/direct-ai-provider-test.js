const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testDirectProvider() {
  console.log('==================================================');
  console.log('--- DIRECT AI PROVIDER TEST ---');
  
  const provider = (process.env.AI_PROVIDER || 'GROQ').toUpperCase();
  const modelName = process.env.AI_MODEL || (provider === 'GROQ' ? 'llama-3.3-70b-versatile' : 'gemini-1.5-flash');
  
  let apiKey = '';
  if (provider === 'GROQ') {
    apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY || '';
  } else {
    apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
  }

  const keyPresent = apiKey && apiKey.trim() && !apiKey.includes('mock_gemini_api_key');

  console.log('Provider:', provider);
  console.log('Model:', modelName);
  console.log('API Key Status:', keyPresent ? 'PRESENT' : 'MISSING');
  console.log('==================================================');

  if (!keyPresent) {
    console.log('RESULT: API key is MISSING or placeholder. Safe AI unavailable mode active.');
    return;
  }

  try {
    if (provider === 'GROQ') {
      const groq = new Groq({ apiKey });
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'user', content: 'Hello, answer in one short sentence.' },
        ],
        model: modelName,
      });

      const responseText = completion.choices?.[0]?.message?.content;
      console.log('GROQ DIRECT RESPONSE:', responseText);
      console.log('RESULT: SUCCESS');
    } else if (provider === 'GEMINI') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello, answer in one short sentence.');
      const responseText = result.response.text();
      console.log('GEMINI DIRECT RESPONSE:', responseText);
      console.log('RESULT: SUCCESS');
    } else {
      console.log('RESULT: UNKNOWN PROVIDER', provider);
    }
  } catch (err) {
    console.error('PROVIDER DIRECT ERROR:', err.message);
    console.log('RESULT: PROVIDER ERROR (Handled by AiService categorized error logger)');
  }
}

testDirectProvider();

