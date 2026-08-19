const { Test } = require('@nestjs/testing');
const { AiService, AiErrorCode } = require('./dist/src/modules/ai/ai.service');
const { PrismaService } = require('./dist/src/database/prisma.service');
const { ConfigService } = require('@nestjs/config');
const { ServiceUnavailableException, ForbiddenException, NotFoundException } = require('@nestjs/common');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function runGeminiIntegrationSuite() {
  console.log('==================================================');
  console.log('--- GIPPO.UZ REAL GEMINI 3.6 FLASH INTEGRATION SUITE ---');
  console.log('==================================================\n');

  const inMemoryConvs = new Map();
  const inMemoryMsgs = [];

  const mockPrisma = {
    aIConversation: {
      create: async (args) => {
        const id = 'conv-' + Math.random().toString(36).substring(7);
        const record = { id, userId: args.data.userId, title: args.data.title, createdAt: new Date(), updatedAt: new Date() };
        inMemoryConvs.set(id, { ...record, messages: [] });
        return record;
      },
      findUnique: async (args) => {
        const conv = inMemoryConvs.get(args.where.id);
        if (!conv) return null;
        return {
          ...conv,
          messages: inMemoryMsgs.filter((m) => m.conversationId === args.where.id),
        };
      },
      findMany: async (args) => {
        const userConvs = Array.from(inMemoryConvs.values()).filter((c) => c.userId === args.where.userId);
        return userConvs.map((conv) => ({
          ...conv,
          messages: inMemoryMsgs.filter((m) => m.conversationId === conv.id).slice(-1),
        }));
      },
    },
    aIMessage: {
      create: async (args) => {
        const id = 'msg-' + Math.random().toString(36).substring(7);
        const record = { id, ...args.data, createdAt: new Date() };
        inMemoryMsgs.push(record);
        return record;
      },
    },
  };

  const realConfig = {
    get: (key) => {
      if (key === 'AI_PROVIDER') return process.env.AI_PROVIDER || 'GEMINI';
      if (key === 'AI_MODEL') return process.env.AI_MODEL || 'gemini-3.6-flash';
      if (key === 'GEMINI_API_KEY') return process.env.GEMINI_API_KEY;
      if (key === 'AI_TIMEOUT_MS') return '45000';
      return process.env[key] || null;
    },
  };

  const moduleRef = await Test.createTestingModule({
    providers: [
      AiService,
      { provide: PrismaService, useValue: mockPrisma },
      { provide: ConfigService, useValue: realConfig },
    ],
  }).compile();

  const aiService = moduleRef.get(AiService);
  aiService.onModuleInit();

  // Test 1: Real Gemini Request & Response (Guest)
  console.log('\n[TEST 1] Real Gemini 3.6 Flash Request (Guest User):');
  const guestRes = await aiService.processChat(null, {
    message: 'Hello, how can I maintain a healthy sleep schedule?',
  });

  if (!guestRes.reply || guestRes.reply.includes('Based on your query') || guestRes.reply.length < 20) {
    throw new Error('TEST 1 FAILED: Expected real Gemini reply');
  }
  console.log('✅ PASS [TEST 1]: Real Gemini Response received:');
  console.log('Snippet:', guestRes.reply.slice(0, 140) + '...');
  console.log('ConversationId:', guestRes.conversationId);
  console.log('Emergency:', guestRes.isEmergency);

  // Test 2: Real Gemini Request & DB Persistence (Authenticated User)
  console.log('\n[TEST 2] Real Gemini Request with DB Persistence (User: user-patient-42):');
  const authRes1 = await aiService.processChat('user-patient-42', {
    message: 'Salom Gippo! Soglom ovqatlanish haqida maslahat bering.',
  });

  if (!authRes1.conversationId || !authRes1.messageId) {
    throw new Error('TEST 2 FAILED: Missing conversationId or messageId');
  }
  console.log('✅ PASS [TEST 2]: Authenticated conversation created');
  console.log('Saved Conv ID:', authRes1.conversationId);
  console.log('Saved Message ID:', authRes1.messageId);
  console.log('Uzbek Reply Snippet:', authRes1.reply.slice(0, 140) + '...');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Test 3: Multi-turn chat continuity in same conversation
  console.log('\n[TEST 3] Multi-turn Chat in same conversation:');
  await sleep(3000);
  const authRes2 = await aiService.processChat('user-patient-42', {
    conversationId: authRes1.conversationId,
    message: 'Kunda qancha suv ichish kerak?',
  });

  if (authRes2.conversationId !== authRes1.conversationId) {
    throw new Error('TEST 3 FAILED: Conversation ID mismatch in multi-turn chat');
  }
  console.log('✅ PASS [TEST 3]: Multi-turn chat successfully continued in same conversation');
  console.log('Follow-up Reply Snippet:', authRes2.reply.slice(0, 140) + '...');

  // Test 4: History Retrieval & User Isolation
  console.log('\n[TEST 4] History Retrieval & Authorization Isolation:');
  const userConvs = await aiService.getUserConversations('user-patient-42');
  if (userConvs.length === 0) throw new Error('TEST 4 FAILED: User conversations empty');
  console.log('User conversation count:', userConvs.length);

  const fullHistory = await aiService.getConversationById(authRes1.conversationId, 'user-patient-42');
  console.log('Full history message count (User + AI):', fullHistory.messages.length);
  if (fullHistory.messages.length !== 4) {
    throw new Error(`TEST 4 FAILED: Expected 4 messages (2 user + 2 assistant), got ${fullHistory.messages.length}`);
  }

  // Check isolation: other user cannot access this conversation
  let isolationPassed = false;
  try {
    await aiService.getConversationById(authRes1.conversationId, 'user-intruder-999');
  } catch (err) {
    if (err instanceof ForbiddenException) {
      isolationPassed = true;
    }
  }
  if (!isolationPassed) throw new Error('TEST 4 FAILED: Authorization isolation bypassed');
  console.log('✅ PASS [TEST 4]: Conversation history & user isolation verified (ForbiddenException on intruder)');

  // Test 5: Language Tests (Russian & English)
  console.log('\n[TEST 5] Language Detection & Verification (Russian & English):');
  await sleep(4000);
  const ruRes = await aiService.processChat(null, {
    message: 'Здравствуйте! Какие витамины полезны весной?',
  });
  console.log('Russian Snippet:', ruRes.reply.slice(0, 120) + '...');
  const hasRuDisclaimer = ruRes.reply.includes('Gippo ИИ является информационным инструментом');
  if (!hasRuDisclaimer) throw new Error('TEST 5 FAILED: Russian response missing localized Russian disclaimer');
  console.log('✅ PASS [TEST 5.1]: Russian response + Russian disclaimer validated');

  await sleep(4000);
  const enRes = await aiService.processChat(null, {
    message: 'What are basic exercises to improve lower back strength?',
  });
  console.log('English Snippet:', enRes.reply.slice(0, 120) + '...');
  const hasEnDisclaimer = enRes.reply.includes('Gippo AI is an informational tool and does not replace');
  if (!hasEnDisclaimer) throw new Error('TEST 5 FAILED: English response missing localized English disclaimer');
  console.log('✅ PASS [TEST 5.2]: English response + English disclaimer validated');

  // Test 6: Emergency Detection
  console.log('\n[TEST 6] Emergency Detection & 103 Call Warning:');
  await sleep(4000);
  const emRes = await aiService.processChat(null, {
    message: 'Emergency! I have acute chest pain and I cannot breathe!',
  });
  if (!emRes.isEmergency || !emRes.reply.includes('103') || !emRes.reply.includes('EMERGENCY')) {
    throw new Error('TEST 6 FAILED: Emergency detection failed');
  }
  console.log('✅ PASS [TEST 6]: Emergency keyword triggered isEmergency=true and 103 emergency notice');

  // Test 7: No Fake Fallback when Key is Missing/Invalid (Throws 503)
  console.log('\n[TEST 7] No Fake Fallback Verification (Throws 503 on Missing/Invalid Key):');
  const mockConfigMissing = {
    get: (key) => {
      if (key === 'AI_PROVIDER') return 'GEMINI';
      if (key === 'AI_MODEL') return 'gemini-3.6-flash';
      if (key === 'GEMINI_API_KEY') return '';
      return null;
    },
  };

  const moduleRefMissing = await Test.createTestingModule({
    providers: [
      AiService,
      { provide: PrismaService, useValue: mockPrisma },
      { provide: ConfigService, useValue: mockConfigMissing },
    ],
  }).compile();

  const aiServiceMissing = moduleRefMissing.get(AiService);
  aiServiceMissing.onModuleInit();

  let thrown503 = false;
  try {
    await aiServiceMissing.processChat(null, { message: 'Should throw 503' });
  } catch (err) {
    if (err instanceof ServiceUnavailableException) {
      thrown503 = true;
      const resp = err.getResponse();
      console.log('Received structured 503 response:', JSON.stringify(resp));
    }
  }

  if (!thrown503) {
    throw new Error('TEST 7 FAILED: Expected ServiceUnavailableException when Gemini key is missing, but fake response was returned');
  }
  console.log('✅ PASS [TEST 7]: Correctly threw 503 ServiceUnavailableException instead of fake fallback');

  console.log('\n==================================================');
  console.log('🎉 ALL 7 GEMINI INTEGRATION TESTS PASSED 100%!');
  console.log('==================================================\n');
}

runGeminiIntegrationSuite().catch((err) => {
  console.error('\n❌ INTEGRATION SUITE FAILED:', err);
  process.exit(1);
});
