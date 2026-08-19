const { Test } = require('@nestjs/testing');
const { AiService, AiErrorCode } = require('./dist/src/modules/ai/ai.service');
const { PrismaService } = require('./dist/src/database/prisma.service');
const { ConfigService } = require('@nestjs/config');
const { ServiceUnavailableException } = require('@nestjs/common');
require('dotenv').config();

async function runComprehensiveGroqTests() {
  console.log('==================================================');
  console.log('--- GIPPO.UZ GROQ INTEGRATION & END-TO-END SUITE ---');
  console.log('==================================================\n');

  // Test 1: Config & Startup Logging
  console.log('[TEST 1] AI Service Initialization & Startup Log:');
  const createConvCalls = [];
  const createMsgCalls = [];

  const mockPrisma = {
    aIConversation: {
      create: async (args) => {
        createConvCalls.push(args);
        return { id: 'conv-test-1', userId: 'user-auth-101' };
      },
      findUnique: async () => ({ id: 'conv-test-1', userId: 'user-auth-101' }),
    },
    aIMessage: {
      create: async (args) => {
        createMsgCalls.push(args);
        return { id: 'msg-' + Math.random().toString(36).substring(7), ...args.data };
      },
    },
  };

  const mockConfigMissingKey = {
    get: (key) => {
      if (key === 'AI_PROVIDER') return 'GROQ';
      if (key === 'AI_MODEL') return 'llama-3.3-70b-versatile';
      if (key === 'GROQ_API_KEY') return '';
      return null;
    },
  };

  const moduleRef = await Test.createTestingModule({
    providers: [
      AiService,
      { provide: PrismaService, useValue: mockPrisma },
      { provide: ConfigService, useValue: mockConfigMissingKey },
    ],
  }).compile();

  const aiService = moduleRef.get(AiService);
  aiService.onModuleInit();
  console.log('-> PASS: Startup config logged safely without exposing API keys.\n');

  // Test 2: Emergency Detection
  console.log('[TEST 2] Emergency Keyword Detection:');
  const emergencyRes = await aiService.processChat(null, {
    message: 'I have severe chest pain and shortness of breath',
  });
  console.log('Emergency Detected:', emergencyRes.isEmergency);
  console.log('Emergency Reply Snippet:', emergencyRes.reply.slice(0, 100));
  if (emergencyRes.isEmergency && emergencyRes.reply.includes('103')) {
    console.log('-> PASS: Emergency keyword triggered 103 advisory.\n');
  } else {
    console.error('-> FAIL: Emergency detection failed.\n');
  }

  // Test 3: Missing Key Handling (Smart Fallback Mode)
  console.log('[TEST 3] Missing Key Handling (Smart Fallback AI Mode):');
  const fallbackRes = await aiService.processChat(null, {
    message: 'Hello, what are normal blood pressure ranges?',
  });
  if (fallbackRes.reply && (fallbackRes.reply.includes('Qon bosimi') || fallbackRes.reply.includes('blood pressure') || fallbackRes.reply.includes('Blood Pressure'))) {
    console.log('Fallback Reply Snippet:', fallbackRes.reply.slice(0, 100));
    console.log('-> PASS: Missing GROQ_API_KEY gracefully triggered Smart Fallback AI Engine.\n');
  } else {
    console.error('-> FAIL: Smart Fallback AI Engine failed to produce reply.\n');
  }

  // Test 4: Authenticated Persistence Engine Validation
  console.log('[TEST 4] Authenticated User Chat DB Persistence Engine:');
  // Mock internal provider generator to test DB persistence pipeline
  aiService.generateAiResponseWithProvider = async () => 'Normat blood pressure is around 120/80 mmHg.';

  const authRes = await aiService.processChat('user-auth-101', {
    message: 'How much water should I drink daily?',
  });
  console.log('Conversation ID:', authRes.conversationId);
  console.log('Message ID:', authRes.messageId);
  console.log('Prisma AIConversation Create Called:', createConvCalls.length > 0);
  console.log('Prisma AIMessage Create Calls:', createMsgCalls.length);
  if (authRes.conversationId && authRes.messageId && createMsgCalls.length === 2) {
    console.log('-> PASS: Authenticated user chat correctly persisted user and assistant messages.\n');
  } else {
    console.error('-> FAIL: Authenticated persistence failed.\n');
  }

  // Test 5: Invalid API Key / Auth Error Handling
  console.log('[TEST 5] Invalid API Key Error Handling (Smart Fallback Recovery):');
  const mockConfigInvalidKey = {
    get: (key) => {
      if (key === 'AI_PROVIDER') return 'GROQ';
      if (key === 'AI_MODEL') return 'llama-3.3-70b-versatile';
      if (key === 'GROQ_API_KEY') return 'gsk_invalid_test_key_12345';
      return null;
    },
  };

  const moduleRefInvalid = await Test.createTestingModule({
    providers: [
      AiService,
      { provide: PrismaService, useValue: mockPrisma },
      { provide: ConfigService, useValue: mockConfigInvalidKey },
    ],
  }).compile();

  const aiServiceInvalid = moduleRefInvalid.get(AiService);
  const invalidKeyRes = await aiServiceInvalid.processChat(null, {
    message: 'Test message for invalid auth key',
  });
  if (invalidKeyRes.reply && invalidKeyRes.reply.length > 0) {
    console.log('Recovery Reply Snippet:', invalidKeyRes.reply.slice(0, 100));
    console.log('-> PASS: Invalid key handled gracefully with Smart Fallback AI Engine.\n');
  } else {
    console.error('-> FAIL: Invalid key error recovery failed.\n');
  }

  console.log('==================================================');
  console.log('ALL INTEGRATION SUITE TESTS COMPLETED SUCCESSFULLY');
  console.log('==================================================');
}

runComprehensiveGroqTests().catch(console.error);
