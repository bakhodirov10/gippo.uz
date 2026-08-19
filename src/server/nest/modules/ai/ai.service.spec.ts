import { Test, TestingModule } from '@nestjs/testing';
import { AiErrorCode, AiService, detectLanguage } from './ai.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AISender } from '@prisma/client';
import { ServiceUnavailableException, BadRequestException } from '@nestjs/common';

describe('AiService — 100% Real Gemini AI Architecture', () => {
  let service: AiService;

  const mockConversations = new Map<string, any>();
  const mockMessages: any[] = [];

  const mockPrismaService = {
    aIConversation: {
      create: jest.fn().mockImplementation(({ data }) => {
        const conv = { id: 'conv-test-100', userId: data.userId, title: data.title };
        mockConversations.set(conv.id, conv);
        return Promise.resolve(conv);
      }),
      findUnique: jest.fn().mockImplementation(({ where, include }) => {
        const conv = mockConversations.get(where.id);
        if (!conv) return Promise.resolve(null);
        if (include?.messages) {
          const msgs = mockMessages.filter((m) => m.conversationId === conv.id);
          return Promise.resolve({ ...conv, messages: msgs });
        }
        return Promise.resolve(conv);
      }),
    },
    aIMessage: {
      create: jest.fn().mockImplementation(({ data }) => {
        const msg = { id: 'msg-' + Math.random().toString(36).substring(7), ...data };
        mockMessages.push(msg);
        return Promise.resolve(msg);
      }),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string): any => {
      if (key === 'AI_PROVIDER') return 'GEMINI';
      if (key === 'AI_MODEL') return 'gemini-3.6-flash';
      if (key === 'GEMINI_API_KEY') return 'test-valid-gemini-key';
      if (key === 'AI_TIMEOUT_MS') return '30000';
      return null;
    }),
  };

  beforeEach(async () => {
    mockConversations.clear();
    mockMessages.length = 0;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Language Detection', () => {
    it('should detect Uzbek correctly (Latin & Cyrillic)', () => {
      expect(detectLanguage('Salom, boshim ogriyapti nima qilish kerak')).toBe('uz');
      expect(detectLanguage('Салом, бошим оғрияпти нима қилишим керак')).toBe('uz');
      expect(detectLanguage("Ko'krak qafasida og'riq bor")).toBe('uz');
    });

    it('should detect Russian correctly', () => {
      expect(detectLanguage('Здравствуйте, у меня болит голова')).toBe('ru');
      expect(detectLanguage('Каковы симптомы простуды?')).toBe('ru');
    });

    it('should detect English correctly', () => {
      expect(detectLanguage('Hello, I have a headache what should I do?')).toBe('en');
      expect(detectLanguage('What is hypertension?')).toBe('en');
    });
  });

  describe('Validation & Error Handling (NO Fallbacks)', () => {
    it('should throw BadRequestException on empty message', async () => {
      await expect(
        service.processChat(null, { message: '   ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ServiceUnavailableException with AI_AUTH_ERROR when Gemini key fails', async () => {
      (service as any).geminiClient = {
        models: {
          generateContent: jest.fn().mockRejectedValue({
            status: 401,
            message: 'API_KEY_INVALID: The provided API key is invalid',
          }),
        },
      };

      try {
        await service.processChat(null, { message: 'Salom' });
        fail('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ServiceUnavailableException);
        const res: any = err.getResponse();
        expect(res.error.code).toBe(AiErrorCode.AI_AUTH_ERROR);
      }
    });

    it('should throw ServiceUnavailableException with AI_RATE_LIMIT on 429 quota error', async () => {
      (service as any).geminiClient = {
        models: {
          generateContent: jest.fn().mockRejectedValue({
            status: 429,
            message: 'RESOURCE_EXHAUSTED: Quota exceeded for quota metric',
          }),
        },
      };

      try {
        await service.processChat(null, { message: 'Salom' });
        fail('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ServiceUnavailableException);
        const res: any = err.getResponse();
        expect(res.error.code).toBe(AiErrorCode.AI_RATE_LIMIT);
      }
    });

    it('should throw ServiceUnavailableException with AI_TIMEOUT on timeout', async () => {
      mockConfigService.get.mockImplementation((key: string): any => {
        if (key === 'AI_TIMEOUT_MS') return '50';
        if (key === 'GEMINI_API_KEY') return 'test-valid-gemini-key';
        return null;
      });

      (service as any).geminiClient = {
        models: {
          generateContent: jest.fn().mockReturnValue(
            new Promise((resolve) => setTimeout(resolve, 500)),
          ),
        },
      };

      try {
        await service.processChat(null, { message: 'Salom' });
        fail('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ServiceUnavailableException);
        const res: any = err.getResponse();
        expect(res.error.code).toBe(AiErrorCode.AI_TIMEOUT);
      }
    });
  });

  describe('Real Gemini Response Processing', () => {
    it('should return real response from Gemini with localized disclaimer', async () => {
      const mockGeminiReply = "Bosh og'rig'i ko'plab sabablarga ko'ra yuzaga kelishi mumkin. Dam oling va yetarli suv iching.";
      (service as any).geminiClient = {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: mockGeminiReply,
          }),
        },
      };

      const res = await service.processChat(null, {
        message: 'Boshim ogriyapti',
      });

      expect(res.reply).toContain(mockGeminiReply);
      expect(res.reply).toContain("Gippo AI ma'lumot beruvchi vosita");
      expect(res.isEmergency).toBe(false);
    });

    it('should prepend emergency warning for emergency symptoms while keeping Gemini response', async () => {
      const mockGeminiReply = "Bu alomatlar jiddiy holatni ko'rsatishi mumkin.";
      (service as any).geminiClient = {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: mockGeminiReply,
          }),
        },
      };

      const res = await service.processChat(null, {
        message: "Menda kuchli ko'krak og'riq va nafas qisishi bor",
      });

      expect(res.isEmergency).toBe(true);
      expect(res.reply).toContain('SHOSHILINCH OGOHLANTIRISH');
      expect(res.reply).toContain('103');
      expect(res.reply).toContain(mockGeminiReply);
    });

    it('should save conversation and messages in Prisma when userId is provided', async () => {
      const mockGeminiReply = "Salom! Sizga qanday yordam bera olaman?";
      (service as any).geminiClient = {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: mockGeminiReply,
          }),
        },
      };

      const res = await service.processChat('user-123', {
        message: 'Salom, qalaysan?',
      });

      expect(res.conversationId).toBe('conv-test-100');
      expect(res.messageId).toBeDefined();
      expect(mockPrismaService.aIConversation.create).toHaveBeenCalled();
      expect(mockPrismaService.aIMessage.create).toHaveBeenCalledTimes(2); // 1 user + 1 assistant
    });
  });
});
