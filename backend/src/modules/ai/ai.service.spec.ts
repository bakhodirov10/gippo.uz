import { Test, TestingModule } from '@nestjs/testing';
import { AiService, detectLanguage } from './ai.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AISender } from '@prisma/client';

describe('AiService - Language Detection & Multi-lingual Assistant', () => {
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
    get: jest.fn((key: string) => {
      if (key === 'AI_PROVIDER') return 'GROQ';
      if (key === 'AI_MODEL') return 'llama-3.3-70b-versatile';
      if (key === 'GROQ_API_KEY') return ''; // Triggers fallback mode cleanly
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

  // 1. Uzbek message -> Uzbek response instruction
  it('1. should process Uzbek message and return Uzbek response with Uzbek disclaimer', async () => {
    const res = await service.processChat(null, {
      message: 'Salom, boshim ogriyapti, nima qilishim kerak?',
    });

    expect(res.isEmergency).toBe(false);
    expect(res.reply).toContain("Gippo AI ma'lumot beruvchi vosita");
    expect(res.reply).toContain("Bosh og'rig'i");
  });

  // 2. Russian message -> Russian response instruction
  it('2. should process Russian message and return Russian response with Russian disclaimer', async () => {
    const res = await service.processChat(null, {
      message: 'Здравствуйте, у меня болит голова. Что мне делать?',
    });

    expect(res.isEmergency).toBe(false);
    expect(res.reply).toContain('Gippo ИИ является информационным инструментом');
    expect(res.reply).toContain('Головная боль');
  });

  // 3. English message -> English response instruction
  it('3. should process English message and return English response with English disclaimer', async () => {
    const res = await service.processChat(null, {
      message: 'Hello, I have a headache. What should I do?',
    });

    expect(res.isEmergency).toBe(false);
    expect(res.reply).toContain('Gippo AI is an informational tool');
    expect(res.reply).toContain('Headaches can occur');
  });

  // 4. Mixed Uzbek/Russian -> dominant language
  it('4. should determine dominant language for mixed input', () => {
    // Dominant Uzbek
    const langUz = detectLanguage('Salom doctor, boshim ogriyapti nima qilish kerak');
    expect(langUz).toBe('uz');

    // Dominant Russian
    const langRu = detectLanguage('Здравствуйте доктор, у меня болит голова и температура');
    expect(langRu).toBe('ru');

    // Dominant English
    const langEn = detectLanguage('Hello doctor, I feel sick and have fever');
    expect(langEn).toBe('en');
  });

  // 5. Conversation switches from Russian to Uzbek
  it('5. should switch response language to Uzbek when conversation was initially Russian', async () => {
    // Setup initial conversation in Russian
    const convId = 'conv-ru-to-uz';
    mockConversations.set(convId, { id: convId, userId: 'user-1' });
    mockMessages.push({
      id: 'msg-1',
      conversationId: convId,
      sender: AISender.USER,
      content: 'Здравствуйте, у меня болит голова.',
    });
    mockMessages.push({
      id: 'msg-2',
      conversationId: convId,
      sender: AISender.ASSISTANT,
      content: 'Здравствуйте! Головная боль...',
    });

    // Send new message in Uzbek
    const res = await service.processChat('user-1', {
      conversationId: convId,
      message: 'Rahmat shifokor, endi oshqozonim ogriyapti nima qilsam bo\'ladi?',
    });

    expect(res.conversationId).toBe(convId);
    expect(res.reply).toContain("Gippo AI ma'lumot beruvchi vosita");
    expect(res.reply).toContain('Oshqozon');
  });

  // 6. Conversation switches from Uzbek to Russian
  it('6. should switch response language to Russian when conversation was initially Uzbek', async () => {
    // Setup initial conversation in Uzbek
    const convId = 'conv-uz-to-ru';
    mockConversations.set(convId, { id: convId, userId: 'user-1' });
    mockMessages.push({
      id: 'msg-1',
      conversationId: convId,
      sender: AISender.USER,
      content: 'Salom, boshim ogriyapti.',
    });

    // Send new message in Russian
    const res = await service.processChat('user-1', {
      conversationId: convId,
      message: 'Здравствуйте, у меня поднялась температура. Что делать?',
    });

    expect(res.conversationId).toBe(convId);
    expect(res.reply).toContain('Gippo ИИ является информационным инструментом');
    expect(res.reply).toContain('простуде');
  });

  // 7. Emergency message in Uzbek
  it('7. should return emergency response in Uzbek for Uzbek emergency input', async () => {
    const res = await service.processChat(null, {
      message: 'Menda ko\'krak og\'rig\'i va nafas qisishi bor',
    });

    expect(res.isEmergency).toBe(true);
    expect(res.reply).toContain('SHOSHILINCH OGOHLANTIRISH');
    expect(res.reply).toContain('103');
    expect(res.reply).toContain("Gippo AI ma'lumot beruvchi vosita");
  });

  // 8. Emergency message in Russian
  it('8. should return emergency response in Russian for Russian emergency input', async () => {
    const res = await service.processChat(null, {
      message: 'У меня сильная боль в груди и одышка',
    });

    expect(res.isEmergency).toBe(true);
    expect(res.reply).toContain('ЭКСТРЕННОЕ ПРЕДУПРЕЖДЕНИЕ');
    expect(res.reply).toContain('103');
    expect(res.reply).toContain('Gippo ИИ является информационным инструментом');
  });

  // 9. Emergency message in English
  it('9. should return emergency response in English for English emergency input', async () => {
    const res = await service.processChat(null, {
      message: 'I have severe chest pain and shortness of breath',
    });

    expect(res.isEmergency).toBe(true);
    expect(res.reply).toContain('EMERGENCY ALERT');
    expect(res.reply).toContain('103');
    expect(res.reply).toContain('Gippo AI is an informational tool');
  });

  // 10. Localized medical disclaimer
  it('10. should attach exact localized medical disclaimer based on language', async () => {
    const resUz = await service.processChat(null, { message: 'Qon bosimi haqida ma\'lumot bering' });
    expect(resUz.reply).toContain(
      "Gippo AI ma'lumot beruvchi vosita bolib, professional tibbiy maslahat, tashxis yoki davolash ornini bosmaydi. Sogligingiz bilan bogliq muammolar bolsa, tasdiqlangan shifokorga murojaat qiling. Favqulodda holatda 103 raqamiga qongiroq qiling.",
    );

    const resRu = await service.processChat(null, { message: 'Расскажите про давление' });
    expect(resRu.reply).toContain(
      'Gippo ИИ является информационным инструментом и не заменяет профессиональную медицинскую консультацию, диагностику или лечение. При проблемах со здоровьем обратитесь к проверенному врачу. В экстренной ситуации звоните по номеру 103.',
    );

    const resEn = await service.processChat(null, { message: 'Tell me about blood pressure' });
    expect(resEn.reply).toContain(
      'Gippo AI is an informational tool and does not replace professional medical advice, diagnosis, or treatment. For health concerns, consult a verified doctor. In an emergency, call 103.',
    );
  });

  // Verification of API fields structure
  it('should return required payload structure (conversationId, messageId, reply, isEmergency)', async () => {
    const res = await service.processChat('user-1', {
      message: 'What is high blood pressure?',
    });

    expect(res).toHaveProperty('conversationId');
    expect(res).toHaveProperty('messageId');
    expect(res).toHaveProperty('reply');
    expect(res).toHaveProperty('isEmergency');
    expect(res.conversationId).toBe('conv-test-100');
  });
});


