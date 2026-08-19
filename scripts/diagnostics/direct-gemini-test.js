/**
 * Direct Gemini Provider Test — @google/genai SDK
 *
 * This test verifies that the GEMINI_API_KEY can make a REAL request
 * to Google Gemini and receive a REAL response.
 *
 * Usage:
 *   node direct-gemini-test.js
 *
 * Requires: GEMINI_API_KEY in .env or as environment variable.
 */

const { GoogleGenAI } = require('@google/genai');
const path = require('path');

// Load .env from backend directory
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gemini-3.6-flash';

  console.log('==================================================');
  console.log('GIPPO.UZ — Direct Gemini Provider Test');
  console.log('==================================================');
  console.log(`GEMINI_API_KEY: ${apiKey ? 'PRESENT' : 'MISSING'}`);
  console.log(`AI_MODEL: ${model}`);
  console.log(`SDK: @google/genai`);
  console.log('==================================================');

  if (!apiKey) {
    console.error('❌ FAIL: GEMINI_API_KEY is not configured');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  console.log('\n--- Test 1: Basic connectivity ---');
  try {
    const result = await ai.models.generateContent({
      model,
      contents: 'Reply with exactly one short sentence: Gippo AI is connected successfully.',
    });

    const text = result.text;
    if (text && text.trim()) {
      console.log(`✅ PASS: Gemini responded: "${text.trim()}"`);
    } else {
      console.error('❌ FAIL: Empty response from Gemini');
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ FAIL: Gemini request failed: ${err.message}`);
    process.exit(1);
  }

  console.log('\n--- Test 2: Uzbek language ---');
  try {
    const result = await ai.models.generateContent({
      model,
      contents: "Salom, Gippo AI. Bugun o'zimni charchagan his qilyapman.",
      config: {
        systemInstruction: 'You are Gippo AI. Always respond in the same language as the user. Respond in Uzbek.',
      },
    });

    const text = result.text;
    if (text && text.trim()) {
      console.log(`✅ PASS (UZ): "${text.trim().substring(0, 100)}..."`);
    } else {
      console.error('❌ FAIL (UZ): Empty response');
    }
  } catch (err) {
    console.error(`❌ FAIL (UZ): ${err.message}`);
  }

  console.log('\n--- Test 3: Russian language ---');
  try {
    const result = await ai.models.generateContent({
      model,
      contents: 'Здравствуйте, у меня сегодня болит голова.',
      config: {
        systemInstruction: 'You are Gippo AI. Always respond in the same language as the user. Respond in Russian.',
      },
    });

    const text = result.text;
    if (text && text.trim()) {
      console.log(`✅ PASS (RU): "${text.trim().substring(0, 100)}..."`);
    } else {
      console.error('❌ FAIL (RU): Empty response');
    }
  } catch (err) {
    console.error(`❌ FAIL (RU): ${err.message}`);
  }

  console.log('\n--- Test 4: English language ---');
  try {
    const result = await ai.models.generateContent({
      model,
      contents: 'Hello, I have a headache today.',
      config: {
        systemInstruction: 'You are Gippo AI. Always respond in the same language as the user. Respond in English.',
      },
    });

    const text = result.text;
    if (text && text.trim()) {
      console.log(`✅ PASS (EN): "${text.trim().substring(0, 100)}..."`);
    } else {
      console.error('❌ FAIL (EN): Empty response');
    }
  } catch (err) {
    console.error(`❌ FAIL (EN): ${err.message}`);
  }

  console.log('\n==================================================');
  console.log('Direct Gemini Provider Test COMPLETED');
  console.log('==================================================');
}

testGemini().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
