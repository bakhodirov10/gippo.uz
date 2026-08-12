import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { AISender } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export enum AiErrorCode {
  AI_CONFIG_ERROR = 'AI_CONFIG_ERROR',
  AI_AUTH_ERROR = 'AI_AUTH_ERROR',
  AI_PROVIDER_ERROR = 'AI_PROVIDER_ERROR',
  AI_RATE_LIMIT = 'AI_RATE_LIMIT',
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_VALIDATION_ERROR = 'AI_VALIDATION_ERROR',
  AI_DATABASE_ERROR = 'AI_DATABASE_ERROR',
  AI_UNKNOWN_ERROR = 'AI_UNKNOWN_ERROR',
}

export type SupportedLanguage = 'uz' | 'ru' | 'en';

export function detectLanguage(
  message: string,
  fallbackLang?: SupportedLanguage,
): SupportedLanguage {
  if (!message || !message.trim()) {
    return fallbackLang && ['uz', 'ru', 'en'].includes(fallbackLang) ? fallbackLang : 'uz';
  }

  const text = message.trim();
  const textLower = text.toLowerCase();

  // 1. Check for specific Uzbek Cyrillic letters (ў, қ, ғ, ҳ)
  const uzbekCyrillicChars = textLower.match(/[ўқғҳ]/g) || [];
  if (uzbekCyrillicChars.length > 0) {
    return 'uz';
  }

  // Count Cyrillic vs Latin characters
  const cyrillicMatches = text.match(/[\u0400-\u04FF]/g) || [];
  const latinMatches = text.match(/[a-zA-Z]/g) || [];

  const cyrillicCount = cyrillicMatches.length;
  const latinCount = latinMatches.length;

  // 2. If Cyrillic script dominates:
  if (cyrillicCount > latinCount) {
    const uzbekCyrillicWords = [
      'салом', 'бошим', 'оғрияпти', 'нима', 'қилишим', 'керак', 'раҳмат', 'ҳа',
      'йўқ', 'шифокор', 'тиббий', 'касал', 'оғриқ', 'дори', 'ассалому', 'алайкум',
      'қандай', 'учун', 'борми', 'йўқми', 'бўлса', 'мумкин', 'беринг', 'ёрдам',
      'мен', 'сиз', 'иситма', 'томоқ', 'йўтал', 'қорин', 'юрак', 'қон', 'босим',
    ];
    let uzCyrScore = 0;
    for (const kw of uzbekCyrillicWords) {
      if (textLower.includes(kw)) uzCyrScore += 2;
    }

    const russianMarkers = [
      'ы', 'э', 'ъ', 'ь', 'ё', 'здравствуйте', 'привет', 'болит', 'голова',
      'что', 'делать', 'у меня', 'как', 'болезнь', 'помощь', 'врач', 'температура',
      'кашель', 'давление', 'живот', 'желудок', 'сердце', 'боль', 'лечение',
      'лекарство', 'принимать', 'пожалуйста', 'спасибо', 'добрый', 'простуда',
      'грипп', 'инфаркт', 'тошнота', 'рвота', 'спина', 'нога', 'рука', 'глаз',
      'ухо', 'горло', 'нос', 'гиппо', 'ии', 'мне', 'меня', 'тебя', 'тебе', 'его',
      'ее', 'их', 'нами', 'вами', 'для', 'или', 'если', 'когда', 'где', 'зачем',
      'почему', 'можно', 'нужно', 'нельзя',
    ];
    let ruCyrScore = 0;
    for (const kw of russianMarkers) {
      if (textLower.includes(kw)) ruCyrScore += 1;
    }

    if (uzCyrScore > ruCyrScore) {
      return 'uz';
    }
    return 'ru';
  }

  // 3. If Latin script dominates:
  if (latinCount > 0) {
    const hasUzbekApostrophe = /[og]['’`‘][a-z]/i.test(text) || /[og]['’`‘]/i.test(text);

    const uzbekLatinWords = [
      'salom', 'boshim', 'ogriyapti', 'nima', 'qilishim', 'kerak', 'rahmat', 'ha',
      'yoq', 'yoxud', 'shifokor', 'tibbiy', 'kasal', 'ogriq', 'dori', 'xush', 'qale',
      'yaxshi', 'assalomu', 'alaykum', 'qanday', 'uchun', 'bormi', 'yoqmi', 'bolsa',
      'mumkin', 'bering', 'yordam', 'men', 'mening', 'siz', 'sizning', 'qila',
      'olamanmi', 'isitma', 'tomoq', 'yotal', 'qorin', 'yurak', 'qon', 'bosim',
      'infarkt', 'nafas', 'qisishi', 'charchoq', 'uyqu', 'aka', 'opa', 'uka',
      'singil', 'bo\'lsa', 'yo\'q', 'o\'g\'riq', 'og\'riq', 'og\'riqlar', 'haqida',
      'bilan', 'ham', 'lekin', 'chunki', 'shuning', 'uchun', 'bormen', 'bor',
    ];

    const uzbekSuffixRegex = /\b[a-z]+(yapti|yapman|yapsiz|lar|dan|ning|ingiz|miz)\b/i;

    let uzScore = 0;
    if (hasUzbekApostrophe) uzScore += 3;
    if (uzbekSuffixRegex.test(textLower)) uzScore += 3;

    const words = textLower.split(/[^a-z'’`‘]+/).filter((w) => w.length > 0);

    for (const w of words) {
      if (uzbekLatinWords.includes(w)) {
        uzScore += 2;
      }
    }

    const englishWords = [
      'hello', 'hi', 'hey', 'headache', 'what', 'should', 'i', 'do', 'have', 'has',
      'had', 'the', 'is', 'are', 'am', 'was', 'were', 'you', 'your', 'my', 'mine',
      'pain', 'pains', 'help', 'doctor', 'fever', 'cough', 'treatment', 'medicine',
      'please', 'thanks', 'thank', 'how', 'can', 'could', 'would', 'with', 'for',
      'this', 'that', 'feel', 'feeling', 'feels', 'hurt', 'hurts', 'chest',
      'stomach', 'pressure', 'blood', 'cold', 'flu', 'sick', 'sickness', 'ill',
      'illness', 'emergency', 'urgent', 'hospital', 'clinic', 'symptom',
      'symptoms', 'advice', 'advise', 'take', 'taking', 'call', 'calling',
      'tell', 'me', 'about', 'good', 'morning', 'afternoon', 'evening', 'night',
      'where', 'when', 'why', 'who', 'which', 'there', 'here', 'any', 'some',
      'need', 'want', 'like', 'get', 'got', 'give', 'know',
    ];

    let enScore = 0;
    for (const w of words) {
      if (englishWords.includes(w)) {
        enScore += 2;
      }
    }

    const russianTranslitWords = [
      'zdravstvuyte', 'privet', 'dobriy', 'den', 'vecher', 'bolit', 'golova',
      'chto', 'delat', 'u', 'menya', 'kak', 'dela', 'vrach', 'pomosh',
    ];
    let ruTranslitScore = 0;
    for (const w of words) {
      if (russianTranslitWords.includes(w)) {
        ruTranslitScore += 2;
      }
    }

    if (words.length <= 3) {
      if (words.includes('salom') || words.includes('assalomu')) return 'uz';
      if (words.includes('hello') || words.includes('hi') || words.includes('hey')) return 'en';
      if (words.includes('zdravstvuyte') || words.includes('privet')) return 'ru';
    }

    if (uzScore > enScore && uzScore > ruTranslitScore) {
      return 'uz';
    }
    if (enScore > uzScore && enScore > ruTranslitScore) {
      return 'en';
    }
    if (ruTranslitScore > uzScore && ruTranslitScore > enScore) {
      return 'ru';
    }

    if (uzScore > 0) return 'uz';
    if (enScore > 0) return 'en';
    if (ruTranslitScore > 0) return 'ru';
  }

  // 4. Fallback if uncertain: use previous user message language or default to Uzbek
  if (fallbackLang && ['uz', 'ru', 'en'].includes(fallbackLang)) {
    return fallbackLang;
  }

  return 'uz';
}

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);

  public static readonly SYSTEM_INSTRUCTION = `
You are the Gippo.uz AI Health Assistant. 
STRICT CLINICAL & SAFETY GUIDELINES:
1. You are an AI medical assistant, NOT a licensed medical doctor. Never claim to be a doctor.
2. Do NOT provide definitive medical diagnoses or prescribe dangerous drugs/treatments.
3. Encourage users to consult qualified doctors on Gippo.uz when appropriate.
4. Detect potential emergency situations (chest pain, shortness of breath, severe bleeding, sudden loss of consciousness, stroke symptoms). If detected, IMMEDIATELY instruct the user to call emergency medical services (103) or go to the nearest emergency room.
5. Clearly explain uncertainty and protect user privacy.
6. Always respond in the same language as the user's latest message. Do not switch languages unless the user explicitly asks you to. If the user writes in Uzbek, answer in Uzbek. If the user writes in Russian, answer in Russian. If the user writes in English, answer in English.
`;

  public static readonly DISCLAIMERS: Record<SupportedLanguage, string> = {
    uz: "Gippo AI ma'lumot beruvchi vosita bolib, professional tibbiy maslahat, tashxis yoki davolash ornini bosmaydi. Sogligingiz bilan bogliq muammolar bolsa, tasdiqlangan shifokorga murojaat qiling. Favqulodda holatda 103 raqamiga qongiroq qiling.",
    ru: 'Gippo ИИ является информационным инструментом и не заменяет профессиональную медицинскую консультацию, диагностику или лечение. При проблемах со здоровьем обратитесь к проверенному врачу. В экстренной ситуации звоните по номеру 103.',
    en: 'Gippo AI is an informational tool and does not replace professional medical advice, diagnosis, or treatment. For health concerns, consult a verified doctor. In an emergency, call 103.',
  };

  public static getMedicalDisclaimer(lang: SupportedLanguage = 'uz'): string {
    const text = AiService.DISCLAIMERS[lang] || AiService.DISCLAIMERS.uz;
    return `\n\n---\n*${text}*`;
  }

  public static readonly MEDICAL_DISCLAIMER = AiService.getMedicalDisclaimer('en');

  public static readonly EMERGENCY_MESSAGES: Record<SupportedLanguage, string> = {
    uz: "🚨 SHOSHILINCH OGOHLANTIRISH: Sizning belgilaringiz shoshilinch tibbiy yordamni talab qilishi mumkin. Iltimos, DARXOL tez yordamga (103) qo'ng'iroq qiling yoki eng yaqin shifoxonaning shoshilinch yordam bo'limiga murojaat qiling. Tibbiy yordam olishni kechiktirmang.",
    ru: '🚨 ЭКСТРЕННОЕ ПРЕДУПРЕЖДЕНИЕ: Ваши симптомы похожи на неотложную медицинскую ситуацию. Пожалуйста, НЕМЕДЛЕННО вызовите скорую помощь (103) или обратитесь в ближайшее отделение экстренной медицинской помощи. Не откладывайте обращение к врачу.',
    en: '🚨 EMERGENCY ALERT: Your symptoms sound like an urgent medical emergency. Please IMMEDIATELY call emergency services (103) or go to the nearest hospital emergency room. Do not delay seeking emergency care.',
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.logStartupConfig();
  }

  public logStartupConfig() {
    const provider = (
      this.configService.get<string>('AI_PROVIDER') ||
      process.env.AI_PROVIDER ||
      'GROQ'
    ).toUpperCase();

    const defaultModel = provider === 'GROQ' ? 'llama-3.3-70b-versatile' : 'gemini-1.5-flash';
    const modelName =
      this.configService.get<string>('AI_MODEL') ||
      process.env.AI_MODEL ||
      defaultModel;

    let apiKeyStatus = 'MISSING';
    if (provider === 'GROQ') {
      const key =
        this.configService.get<string>('GROQ_API_KEY') ||
        process.env.GROQ_API_KEY ||
        this.configService.get<string>('AI_API_KEY') ||
        process.env.AI_API_KEY;
      if (key && key.trim() && !key.includes('mock_gemini_api_key')) {
        apiKeyStatus = 'PRESENT';
      }
    } else {
      const key =
        this.configService.get<string>('GEMINI_API_KEY') ||
        process.env.GEMINI_API_KEY ||
        this.configService.get<string>('AI_API_KEY') ||
        process.env.AI_API_KEY;
      if (key && key.trim() && !key.includes('mock_gemini_api_key')) {
        apiKeyStatus = 'PRESENT';
      }
    }

    this.logger.log(`==================================================`);
    this.logger.log(`AI CONFIGURATION INITIALIZED:`);
    this.logger.log(`AI_PROVIDER=${provider}`);
    this.logger.log(`AI_MODEL=${modelName}`);
    this.logger.log(`GROQ_API_KEY=${apiKeyStatus}`);
    this.logger.log(`==================================================`);
  }

  async processChat(userId: string | null | undefined, dto: ChatMessageDto) {
    if (!dto.message || typeof dto.message !== 'string' || !dto.message.trim()) {
      this.logError(AiErrorCode.AI_VALIDATION_ERROR, 'Message cannot be empty');
      throw new BadRequestException('Message body cannot be empty');
    }

    let conversationId = dto.conversationId;
    let aiMessageId: string | null = null;
    let previousUserLanguage: SupportedLanguage | undefined;
    let conversationHistory: Array<{ sender: AISender; content: string }> = [];

    // Fetch conversation history if continuing an existing conversation
    if (conversationId) {
      const existingConv = await this.prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!existingConv) {
        throw new NotFoundException('AI Conversation not found');
      }

      if (userId && existingConv.userId !== userId) {
        throw new ForbiddenException('Access denied to this conversation');
      }

      conversationHistory = existingConv.messages;

      // Find the language of the latest user message in history
      const previousUserMsg = [...existingConv.messages]
        .reverse()
        .find((m) => m.sender === AISender.USER);
      if (previousUserMsg) {
        previousUserLanguage = detectLanguage(previousUserMsg.content);
      }
    }

    // Detect language of user's latest message with fallback to history or Uzbek
    const targetLanguage = detectLanguage(dto.message, previousUserLanguage);

    // Emergency Keyword Detection across English, Uzbek, Russian
    const emergencyKeywords = [
      'chest pain',
      "can't breathe",
      'cant breathe',
      'shortness of breath',
      'stroke',
      'severe bleeding',
      'unconscious',
      'heart attack',
      'infarkt',
      'nafas qisishi',
      'kokrak ogriq',
      "ko'krak og'riq",
      'nafas ololmaslik',
      'insult',
      'hushdan ketish',
      'оғриқ',
      'нафас қисиши',
      'инсульт',
      'ҳушдан кетиш',
      'боль в груди',
      'трудно дышать',
      'одышка',
      'потеря сознания',
      'без сознания',
      'сердечный приступ',
      'сильное кровотечение',
    ];
    const isEmergency = emergencyKeywords.some((kw) =>
      dto.message.toLowerCase().includes(kw),
    );

    let aiRawResponse = '';

    if (isEmergency) {
      aiRawResponse = AiService.EMERGENCY_MESSAGES[targetLanguage];
    } else {
      aiRawResponse = await this.generateAiResponseWithProvider(
        dto.message,
        targetLanguage,
        conversationHistory,
      );
    }

    const localizedDisclaimer = AiService.getMedicalDisclaimer(targetLanguage);
    const fullResponse = `${aiRawResponse}${localizedDisclaimer}`;

    // Database persistence
    if (userId) {
      try {
        if (!conversationId) {
          const newConv = await this.prisma.aIConversation.create({
            data: {
              userId,
              title: dto.message.slice(0, 40) + '...',
            },
          });
          conversationId = newConv.id;
        }

        // Record User Message
        await this.prisma.aIMessage.create({
          data: {
            conversationId,
            sender: AISender.USER,
            content: dto.message,
          },
        });

        // Record AI Response
        const aiMessage = await this.prisma.aIMessage.create({
          data: {
            conversationId,
            sender: AISender.ASSISTANT,
            content: fullResponse,
          },
        });
        aiMessageId = aiMessage.id;
      } catch (dbErr: any) {
        if (dbErr instanceof NotFoundException || dbErr instanceof ForbiddenException) {
          throw dbErr;
        }
        this.logError(
          AiErrorCode.AI_DATABASE_ERROR,
          `Prisma database error during AI message storage: ${dbErr.message}`,
          dbErr.stack,
        );
      }
    }

    return {
      conversationId: conversationId || null,
      messageId: aiMessageId,
      reply: fullResponse,
      isEmergency,
    };
  }

  private async generateAiResponseWithProvider(
    userPrompt: string,
    lang: SupportedLanguage = 'uz',
    historyMessages: Array<{ sender: AISender; content: string }> = [],
  ): Promise<string> {
    const provider = (
      this.configService.get<string>('AI_PROVIDER') ||
      process.env.AI_PROVIDER ||
      'GROQ'
    ).toUpperCase();

    let apiKey: string | undefined;
    let modelName: string;

    if (provider === 'GROQ') {
      apiKey =
        this.configService.get<string>('GROQ_API_KEY') ||
        process.env.GROQ_API_KEY ||
        this.configService.get<string>('AI_API_KEY') ||
        process.env.AI_API_KEY;
      modelName =
        this.configService.get<string>('AI_MODEL') ||
        process.env.AI_MODEL ||
        'llama-3.3-70b-versatile';
    } else {
      apiKey =
        this.configService.get<string>('GEMINI_API_KEY') ||
        process.env.GEMINI_API_KEY ||
        this.configService.get<string>('AI_API_KEY') ||
        process.env.AI_API_KEY;
      modelName =
        this.configService.get<string>('AI_MODEL') ||
        process.env.AI_MODEL ||
        'gemini-1.5-flash';
    }

    const isDummyOrMissingKey =
      !apiKey ||
      !apiKey.trim() ||
      apiKey.includes('mock_gemini_api_key') ||
      apiKey === 'My-GROQ-key' ||
      apiKey === 'My-API-key' ||
      apiKey.includes('YOUR_') ||
      apiKey.includes('placeholder');

    if (isDummyOrMissingKey) {
      this.logger.warn(
        `[AiService] Provider API Key is missing or dummy (${provider}). Utilizing Smart Fallback Medical AI Engine.`,
      );
      return this.generateFallbackAiResponse(userPrompt, lang);
    }

    const timeoutMs = 10000;
    const langNames: Record<SupportedLanguage, string> = {
      uz: 'Uzbek',
      ru: 'Russian',
      en: 'English',
    };

    const systemPromptWithLang = `${AiService.SYSTEM_INSTRUCTION}\nCRITICAL DIRECTIVE: You MUST write your entire response in ${langNames[lang]}.`;

    try {
      if (provider === 'GROQ') {
        const groq = new Groq({ apiKey: apiKey! });

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: systemPromptWithLang },
        ];

        // Add recent context (up to last 6 messages)
        const recentHistory = historyMessages.slice(-6);
        for (const msg of recentHistory) {
          messages.push({
            role: msg.sender === AISender.USER ? 'user' : 'assistant',
            content: msg.content,
          });
        }
        messages.push({ role: 'user', content: userPrompt });

        const completionPromise = groq.chat.completions.create({
          messages,
          model: modelName,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI Request Timeout Exceeded')), timeoutMs),
        );

        const completion = (await Promise.race([
          completionPromise,
          timeoutPromise,
        ])) as any;

        const responseText = completion.choices?.[0]?.message?.content;
        if (responseText && responseText.trim()) {
          return responseText.trim();
        }
        throw new Error('Empty response content received from Groq provider');
      } else if (provider === 'GEMINI') {
        const genAI = new GoogleGenerativeAI(apiKey!);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPromptWithLang,
        });

        const fetchPromise = model.generateContent(userPrompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI Request Timeout Exceeded')), timeoutMs),
        );

        const result = (await Promise.race([fetchPromise, timeoutPromise])) as any;
        const responseText = result.response?.text();

        if (responseText && responseText.trim()) {
          return responseText.trim();
        }
        throw new Error('Empty response content received from Gemini provider');
      } else {
        this.logger.warn(
          `[AiService] Unsupported AI Provider: ${provider}. Falling back to Smart Fallback AI Engine.`,
        );
        return this.generateFallbackAiResponse(userPrompt, lang);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const status = err?.status || err?.statusCode;

      if (errMsg.includes('Timeout') || errMsg.includes('ETIMEDOUT')) {
        this.logError(
          AiErrorCode.AI_TIMEOUT,
          `Provider request timed out after ${timeoutMs}ms: ${errMsg}`,
        );
      } else if (
        status === 401 ||
        status === 403 ||
        errMsg.includes('401') ||
        errMsg.includes('403') ||
        errMsg.includes('API_KEY_INVALID') ||
        errMsg.includes('invalid_api_key') ||
        errMsg.includes('invalid api key') ||
        errMsg.includes('Authentication')
      ) {
        this.logError(
          AiErrorCode.AI_AUTH_ERROR,
          `AI Provider API Key authentication failed (${provider}): ${errMsg}`,
        );
      } else if (
        status === 429 ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('rate_limit_exceeded') ||
        errMsg.includes('quota')
      ) {
        this.logError(
          AiErrorCode.AI_RATE_LIMIT,
          `AI Provider rate limit / quota exceeded (${provider}): ${errMsg}`,
        );
      } else {
        this.logError(
          AiErrorCode.AI_PROVIDER_ERROR,
          `AI Provider error occurred (${provider}/${modelName}): ${errMsg}`,
          err.stack,
        );
      }

      this.logger.warn(
        `[AiService] Provider request encountered error. Seamlessly switching to Smart Fallback AI Engine.`,
      );
      return this.generateFallbackAiResponse(userPrompt, lang);
    }
  }

  private generateFallbackAiResponse(
    userPrompt: string,
    lang: SupportedLanguage = 'uz',
  ): string {
    const promptLower = userPrompt.toLowerCase();

    // 1. Headache / Bosh og'rig'i / Головная боль
    if (
      promptLower.includes('headache') ||
      promptLower.includes('bosh og') ||
      promptLower.includes('boshim') ||
      promptLower.includes('головн') ||
      promptLower.includes('голова') ||
      promptLower.includes('мигрень') ||
      promptLower.includes('migren')
    ) {
      if (lang === 'ru') {
        return `Головная боль может возникать по разным причинам:
- **Напряжение и стресс**: Длительная работа за компьютером, усталость и психоэмоциональное напряжение.
- **Обезвоживание**: Недостаточный прием воды в течение дня.
- **Колебания артериального давления**: Повышенное или пониженное давление.
- **Нарушение сна**: Недостаток или нерегулярный сон.

**Рекомендации**:
1. Отдохните в тихой, темной комнате.
2. Выпейте 1-2 стакана чистой воды.
3. Сделайте легкий массаж висков и шеи.
4. Если боль сильная или часто повторяется, запишитесь на прием к проверенному **Неврологу** или **Терапевту** через Gippo.uz.`;
      }
      if (lang === 'en') {
        return `Headaches can occur due to various reasons:
- **Tension and Stress**: Prolonged computer work, fatigue, and emotional stress.
- **Dehydration**: Insufficient water intake throughout the day.
- **Blood Pressure Fluctuations**: High or low blood pressure.
- **Sleep Disturbances**: Lack of or irregular sleep.

**Recommendations**:
1. Rest in a quiet, darkened room.
2. Drink 1-2 glasses of clean water.
3. Perform a gentle massage on your temples and neck.
4. If the headache is severe or recurrent, schedule a consultation with a verified **Neurologist** or **General Practitioner** on Gippo.uz.`;
      }
      return `Bosh og'rig'i turli sabablarga ko'ra yuzaga kelishi mumkin:
- **Zo'riqish va stress**: Uzoq vaqt kompyuter oldida o'tirish, charchoq va ruhiy zo'riqish.
- **Degidratatsiya (Suv yetishmasligi)**: Kun davomida yetarlicha suv ichmaslik.
- **Qon bosimi o'zgarishi**: Yuqori yoki past qon bosimi.
- **Uyqu buzilishi**: Kam yoki tartibsiz uyqu.

**Tavsiyalar**:
1. Tinch va qorong'iroq xonada dam oling.
2. 1-2 stakan toza suv iching.
3. Chakkalarga va bo'yinga yengil massaj qiling.
4. Agar og'riq juda kuchli bo'lsa yoki tez-tez takrorlansa, Gippo.uz orqali verified **Nevrolog** yoki **Terapevt** shifokorlarimiz qabuliga yoziling.`;
    }

    // 2. Fever / Cold / Flu / Shamollash / Иситма / Грипп / Простуда
    if (
      promptLower.includes('fever') ||
      promptLower.includes('cold') ||
      promptLower.includes('flu') ||
      promptLower.includes('shamollash') ||
      promptLower.includes('isitma') ||
      promptLower.includes('grip') ||
      promptLower.includes('простуд') ||
      promptLower.includes('температур') ||
      promptLower.includes('tomoq') ||
      promptLower.includes('yo\'tal') ||
      promptLower.includes('yotal') ||
      promptLower.includes('кашель')
    ) {
      if (lang === 'ru') {
        return `Общие медицинские рекомендации при простуде и высокой температуре:
- **Обильное питье**: Теплый чай, отвар шиповника и чистая вода помогают выводить токсины из организма.
- **Постельный режим**: Организму необходим полноценный отдых для восстановления.
- **Проветривание помещения**: Регулярно проветривайте комнату и поддерживайте влажность воздуха.
- **Контроль температуры**: Если температура превышает 38.5°C, можно принять жаропонижающие средства.

**Примечание**: Для точной диагностики и назначения правильного лечения рекомендуем записаться на онлайн или очный прием к проверенному **Терапевту** на Gippo.uz.`;
      }
      if (lang === 'en') {
        return `General medical advice for colds and high fever:
- **Hydration**: Warm tea, rosehip decoction, and clean water help flush toxins from the body.
- **Bed Rest**: Allow your body full rest to recover.
- **Ventilation**: Regularly air out the room and maintain adequate humidity.
- **Temperature Control**: If body temperature exceeds 38.5°C (101.3°F), antipyretic medication may be considered.

**Note**: For an accurate diagnosis and prescription, consult a verified **General Practitioner** on Gippo.uz.`;
      }
      return `Shamollash va yuqori harorat bo'yicha umumiy tibbiy tavsiyalar:
- **Ko'p suyuqlik ichish**: Iliq choy, na'motak damlamasi va toza suv organizmdan toksinlarni chiqarishga yordam beradi.
- **Yotoq rejimi**: Organizmga tiklanish uchun to'liq dam berish lozim.
- **Xona havosini almashtirish**: Xonani muntazam shamollatib turish va namlikni saqlash.
- **Tana haroratini nazorat qilish**: Harorat 38.5°C dan oshsa, isitma tushiruvchi vositalar qabul qilish mumkin.

**Eslatma**: Ishonchli va aniq tashxis qo'yish hamda to'g'ri dori-darmonlar retseptini olish uchun Gippo.uz platformasidagi verified **Terapevt** shifokorlarimiz bilan onlayn yoki klinik qabulga yozilishni maslahat beramiz.`;
    }

    // 3. Blood Pressure / Qon bosimi / Давление
    if (
      promptLower.includes('pressure') ||
      promptLower.includes('bosim') ||
      promptLower.includes('давлен') ||
      promptLower.includes('гипертон') ||
      promptLower.includes('giperton')
    ) {
      if (lang === 'ru') {
        return `Важная информация об артериальном давлении:
- **Нормальные показатели**: Для взрослых около 120/80 мм рт. ст.
- **Симптомы повышенного давления**: Головная боль, потемнение в глазах, учащенное сердцебиение.
- **Симптомы пониженного давления**: Головокружение, слабость, потемнение в глазах.

**Рекомендации**:
1. Измерьте артериальное давление тонометром и запишите результат.
2. Сократите потребление соли и жирной пищи.
3. Проконсультируйтесь с врачом-**Кардиологом** или **Терапевтом** на платформе Gippo.uz.`;
      }
      if (lang === 'en') {
        return `Important information regarding blood pressure:
- **Normal Range**: Approximately 120/80 mmHg for adults.
- **High Blood Pressure Symptoms**: Headache, blurred vision, rapid heartbeat.
- **Low Blood Pressure Symptoms**: Dizziness, weakness, fainting feeling.

**Recommendations**:
1. Measure your blood pressure using a monitor and record it in a log.
2. Reduce salt and fatty food intake.
3. Consult with a verified **Cardiologist** or **General Practitioner** on Gippo.uz.`;
      }
      return `Qon bosimi (arterial bosim) bo'yicha muhim ma'lumotlar:
- **Me'yordagi ko'rsatkich**: Kattalar uchun 120/80 mm sim. ust. atrofida hisoblanadi.
- **Yuqori bosim alomatlari**: Bosh og'rig'i, ko'z oldi qorong'ilashishi, yurak urishi tezlashishi.
- **Past bosim alomatlari**: Bosh aylanishi, hollardan toyish, ko'z tinishi.

**Tavsiyalar**:
1. Qon bosimingizni tonometr yordamida o'lchang va kundalikka yozib boring.
2. Tuz va yog'li taomlar iste'molini kamaytiring.
3. Gippo.uz platformasida faoliyat yuritadigan **Kardiolog** yoki **Terapevt** shifokorlarimiz konsultatsiyasini oling.`;
    }

    // 4. Stomach / Digestive / Oshqozon / Желудок / Живот
    if (
      promptLower.includes('stomach') ||
      promptLower.includes('oshqozon') ||
      promptLower.includes('qorin') ||
      promptLower.includes('желуд') ||
      promptLower.includes('живот') ||
      promptLower.includes('gastro')
    ) {
      if (lang === 'ru') {
        return `Рекомендации при расстройствах желудка и пищеварения:
- **Щадящая диета**: Исключите острую, жирную и жареную пищу.
- **Дробное питание**: Питайтесь небольшими порциями 4-5 раз в день.
- **Баланс жидкости**: Пейте достаточное количество чистой воды и травяных чаев.

**Важно**: При острых болях в животе, тошноте или рвоте срочно обратитесь к врачу-**Гастроэнтерологу** на Gippo.uz.`;
      }
      if (lang === 'en') {
        return `Recommendations for stomach and digestive discomfort:
- **Bland Diet**: Avoid spicy, fatty, and fried foods.
- **Frequent Small Meals**: Helps lessen the burden on the digestive tract.
- **Fluid Intake**: Drink adequate clean water and herbal teas.

**Important**: For severe abdominal pain, nausea, or vomiting, consult a **Gastroenterologist** on Gippo.uz immediately.`;
      }
      return `Oshqozon va hazm qilish tizimi beovtaliqlari bo'yicha tavsiyalar:
- **Yengil parhez**: Achiq, yog'li, qovurilgan va darmonsiz taomlardan tiyiling.
- **Tez-tez va oz-ozdan tamaddi qilish**: Hazm qilish a'zolariga ortiqcha yuklama bermaydi.
- **Suyuqlik BALANSI**: O'simlik choylari va suv ichish tavsiya etiladi.

**Muhim**: Qorindagi o'tkir og'riqlar, ko'ngil aynishi va qayt qilish belgilari bo'lsa, tezda Gippo.uz da ro'yxatdan o'tgan **Gastroenterolog** shifokoriga murojaat qiling.`;
    }

    // 5. Default / General Consultation
    if (lang === 'ru') {
      return `Здравствуйте! Я медицинский ассистент **Gippo AI**.

Ваш запрос принят. По вопросам вашего здоровья рекомендуем обратить внимание на следующее:

1. **Отслеживайте симптомы**: Обратите внимание на то, когда именно начались симптомы и как они проявляются.
2. **Избегайте самолечения**: Не рекомендуется принимать сильные медикаменты без назначения врача.
3. **Консультация специалиста**: Для установки точного диагноза обратитесь к проверенным врачам на платформе **Gippo.uz**.

Если вам нужна подробная информация по конкретному симптому, просто спросите!`;
    }

    if (lang === 'en') {
      return `Hello! I am the **Gippo AI** health assistant.

Your request has been received. For your health questions, please consider:

1. **Monitor Symptoms**: Note when the discomfort started and how it develops.
2. **Avoid Self-Medication**: Do not take strong medications without a prescription from a qualified doctor.
3. **Professional Consultation**: For a definitive diagnosis and treatment plan, consult verified doctors on **Gippo.uz**.

Feel free to ask if you need details regarding a specific symptom!`;
    }

    return `Assalomu alaykum! Men **Gippo AI** tibbiy yordamchisiman.

Sizning so'rovingiz qabul qilindi. Salomatligingizga taalluqli har qanday belgi yoki savollar bo'yicha quyidagilarga e'tibor berishingizni maslahat beramiz:

1. **Symptomlarni kuzatib boring**: Og'riq yoki noqulaylik qachon boshlangani va qanday namoyon bo'layotganiga e'tibor bering.
2. **O'z-ozini davolashdan saqlaning**: Shifokor ko'rigisiz kuchli antibiotiklar va dori vositalarini qabul qilmaslik tavsiya etiladi.
3. **Malakali Mutaxassis Konsultatsiyasi**: Aniq tashxis qo'yish va to'g'ri davolash rejasini tuzish uchun **Gippo.uz** platformasidagi tajribali verified shifokorlarimiz ko'rigidan o'ting.

Qandaydir muayyan belgi (masalan: bosh og'rig'i, isitma, qon bosimi) haqida batafsil ma'lumot kerak bo'lsa, qayta so'rashingiz mumkin!`;
  }

  private logError(code: AiErrorCode, details: string, stack?: string) {
    this.logger.error(`[${code}] ${details}`, stack);
  }

  async getUserConversations(userId: string) {
    return this.prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getConversationById(conversationId: string, userId: string) {
    const conv = await this.prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    if (conv.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return conv;
  }
}



