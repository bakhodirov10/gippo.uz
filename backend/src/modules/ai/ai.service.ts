import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { AISender } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  public static readonly SYSTEM_INSTRUCTION = `
You are the Gippo.uz AI Health Assistant. 
STRICT CLINICAL & SAFETY GUIDELINES:
1. You are an AI medical assistant, NOT a licensed medical doctor. Never claim to be a doctor.
2. Do NOT provide definitive medical diagnoses or prescribe dangerous drugs/treatments.
3. Encourage users to consult qualified doctors on Gippo.uz when appropriate.
4. Detect potential emergency situations (chest pain, shortness of breath, severe bleeding, sudden loss of consciousness, stroke symptoms). If detected, IMMEDIATELY instruct the user to call emergency medical services (103) or go to the nearest emergency room.
5. Clearly explain uncertainty and protect user privacy.
`;

  public static readonly MEDICAL_DISCLAIMER = `

---
*Disclaimer: Gippo AI is an informational tool and does NOT replace professional medical advice, diagnosis, or treatment. Always consult a verified doctor for health concerns. In case of emergency, call 103 immediately.*`;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async processChat(userId: string | null | undefined, dto: ChatMessageDto) {
    if (!dto.message || typeof dto.message !== 'string' || !dto.message.trim()) {
      this.logError(AiErrorCode.AI_VALIDATION_ERROR, 'Message cannot be empty');
      throw new BadRequestException('Message body cannot be empty');
    }

    let conversationId = dto.conversationId;
    let aiMessageId: string | null = null;

    // Check emergency keyword triggers
    const emergencyKeywords = [
      'chest pain',
      'can\'t breathe',
      'shortness of breath',
      'stroke',
      'severe bleeding',
      'unconscious',
      'heart attack',
      'infarkt',
      'nafas qisishi',
    ];
    const isEmergency = emergencyKeywords.some((kw) =>
      dto.message.toLowerCase().includes(kw),
    );

    let aiRawResponse = '';

    if (isEmergency) {
      aiRawResponse =
        '🚨 EMERGENCY ALERT: Your symptoms sound like an urgent medical emergency. Please IMMEDIATELY call emergency services (103) or go to the nearest hospital emergency room. Do not delay seeking emergency care.';
    } else {
      // Execute Provider Request with Error Categorization & Timeout
      aiRawResponse = await this.generateAiResponseWithProvider(dto.message);
    }

    const fullResponse = `${aiRawResponse}${AiService.MEDICAL_DISCLAIMER}`;

    // Database persistence with try-catch (AI_DATABASE_ERROR handling)
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
        } else {
          const existingConv = await this.prisma.aIConversation.findUnique({
            where: { id: conversationId },
          });

          if (!existingConv) {
            throw new NotFoundException('AI Conversation not found');
          }

          if (existingConv.userId !== userId) {
            throw new ForbiddenException('Access denied to this conversation');
          }
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

  private async generateAiResponseWithProvider(userPrompt: string): Promise<string> {
    const apiKey =
      this.configService.get<string>('AI_API_KEY') ||
      this.configService.get<string>('GEMINI_API_KEY') ||
      this.configService.get<string>('OPENAI_API_KEY') ||
      process.env.AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY;

    const provider = (this.configService.get<string>('AI_PROVIDER') || process.env.AI_PROVIDER || 'GEMINI').toUpperCase();
    const modelName = this.configService.get<string>('AI_MODEL') || process.env.AI_MODEL || 'gemini-1.5-flash';

    if (!apiKey || !apiKey.trim()) {
      this.logError(
        AiErrorCode.AI_CONFIG_ERROR,
        `AI_API_KEY is MISSING in environment configuration. Provider: ${provider}. Falling back to default assistant template response.`,
      );
      return this.getFallbackAssistantResponse(userPrompt);
    }

    this.logger.log(`AI_API_KEY = PRESENT. Provider: ${provider}, Model: ${modelName}`);

    const timeoutMs = 10000; // 10s timeout limit

    try {
      if (provider === 'GEMINI') {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: AiService.SYSTEM_INSTRUCTION,
        });

        const fetchPromise = model.generateContent(userPrompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI Request Timeout Exceeded')), timeoutMs),
        );

        const result = (await Promise.race([fetchPromise, timeoutPromise])) as any;
        const responseText = result.response?.text();

        if (responseText) {
          return responseText;
        }
      }
      return this.getFallbackAssistantResponse(userPrompt);
    } catch (err: any) {
      const errMsg = err?.message || String(err);

      if (errMsg.includes('Timeout')) {
        this.logError(AiErrorCode.AI_TIMEOUT, `Provider request timed out after ${timeoutMs}ms: ${errMsg}`);
      } else if (errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('API_KEY_INVALID')) {
        this.logError(AiErrorCode.AI_AUTH_ERROR, `AI Provider API Key authentication failed: ${errMsg}`);
      } else if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        this.logError(AiErrorCode.AI_RATE_LIMIT, `AI Provider rate limit / quota exceeded: ${errMsg}`);
      } else {
        this.logError(AiErrorCode.AI_PROVIDER_ERROR, `AI Provider error occurred (${provider}/${modelName}): ${errMsg}`, err.stack);
      }

      // Safe fallback response so user is never stranded with server crash
      return this.getFallbackAssistantResponse(userPrompt);
    }
  }

  private getFallbackAssistantResponse(userPrompt: string): string {
    return `Based on your query ("${userPrompt}"), here is general health guidance: Ensure adequate hydration, rest well, and monitor any symptoms carefully. If symptoms persist or worsen over the next 24-48 hours, please consult a verified specialist doctor on Gippo.uz for personalized medical evaluation.`;
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
