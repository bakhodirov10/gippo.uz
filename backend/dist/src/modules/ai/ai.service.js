"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = exports.AiErrorCode = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const generative_ai_1 = require("@google/generative-ai");
var AiErrorCode;
(function (AiErrorCode) {
    AiErrorCode["AI_CONFIG_ERROR"] = "AI_CONFIG_ERROR";
    AiErrorCode["AI_AUTH_ERROR"] = "AI_AUTH_ERROR";
    AiErrorCode["AI_PROVIDER_ERROR"] = "AI_PROVIDER_ERROR";
    AiErrorCode["AI_RATE_LIMIT"] = "AI_RATE_LIMIT";
    AiErrorCode["AI_TIMEOUT"] = "AI_TIMEOUT";
    AiErrorCode["AI_VALIDATION_ERROR"] = "AI_VALIDATION_ERROR";
    AiErrorCode["AI_DATABASE_ERROR"] = "AI_DATABASE_ERROR";
    AiErrorCode["AI_UNKNOWN_ERROR"] = "AI_UNKNOWN_ERROR";
})(AiErrorCode || (exports.AiErrorCode = AiErrorCode = {}));
let AiService = AiService_1 = class AiService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(AiService_1.name);
    }
    async processChat(userId, dto) {
        if (!dto.message || typeof dto.message !== 'string' || !dto.message.trim()) {
            this.logError(AiErrorCode.AI_VALIDATION_ERROR, 'Message cannot be empty');
            throw new common_1.BadRequestException('Message body cannot be empty');
        }
        let conversationId = dto.conversationId;
        let aiMessageId = null;
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
        const isEmergency = emergencyKeywords.some((kw) => dto.message.toLowerCase().includes(kw));
        let aiRawResponse = '';
        if (isEmergency) {
            aiRawResponse =
                '🚨 EMERGENCY ALERT: Your symptoms sound like an urgent medical emergency. Please IMMEDIATELY call emergency services (103) or go to the nearest hospital emergency room. Do not delay seeking emergency care.';
        }
        else {
            aiRawResponse = await this.generateAiResponseWithProvider(dto.message);
        }
        const fullResponse = `${aiRawResponse}${AiService_1.MEDICAL_DISCLAIMER}`;
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
                else {
                    const existingConv = await this.prisma.aIConversation.findUnique({
                        where: { id: conversationId },
                    });
                    if (!existingConv) {
                        throw new common_1.NotFoundException('AI Conversation not found');
                    }
                    if (existingConv.userId !== userId) {
                        throw new common_1.ForbiddenException('Access denied to this conversation');
                    }
                }
                await this.prisma.aIMessage.create({
                    data: {
                        conversationId,
                        sender: client_1.AISender.USER,
                        content: dto.message,
                    },
                });
                const aiMessage = await this.prisma.aIMessage.create({
                    data: {
                        conversationId,
                        sender: client_1.AISender.ASSISTANT,
                        content: fullResponse,
                    },
                });
                aiMessageId = aiMessage.id;
            }
            catch (dbErr) {
                if (dbErr instanceof common_1.NotFoundException || dbErr instanceof common_1.ForbiddenException) {
                    throw dbErr;
                }
                this.logError(AiErrorCode.AI_DATABASE_ERROR, `Prisma database error during AI message storage: ${dbErr.message}`, dbErr.stack);
            }
        }
        return {
            conversationId: conversationId || null,
            messageId: aiMessageId,
            reply: fullResponse,
            isEmergency,
        };
    }
    async generateAiResponseWithProvider(userPrompt) {
        const apiKey = this.configService.get('AI_API_KEY') ||
            this.configService.get('GEMINI_API_KEY') ||
            this.configService.get('OPENAI_API_KEY') ||
            process.env.AI_API_KEY ||
            process.env.GEMINI_API_KEY ||
            process.env.OPENAI_API_KEY;
        const provider = (this.configService.get('AI_PROVIDER') || process.env.AI_PROVIDER || 'GEMINI').toUpperCase();
        const modelName = this.configService.get('AI_MODEL') || process.env.AI_MODEL || 'gemini-1.5-flash';
        if (!apiKey || !apiKey.trim()) {
            this.logError(AiErrorCode.AI_CONFIG_ERROR, `AI_API_KEY is MISSING in environment configuration. Provider: ${provider}. Falling back to default assistant template response.`);
            return this.getFallbackAssistantResponse(userPrompt);
        }
        this.logger.log(`AI_API_KEY = PRESENT. Provider: ${provider}, Model: ${modelName}`);
        const timeoutMs = 10000;
        try {
            if (provider === 'GEMINI') {
                const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: AiService_1.SYSTEM_INSTRUCTION,
                });
                const fetchPromise = model.generateContent(userPrompt);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI Request Timeout Exceeded')), timeoutMs));
                const result = (await Promise.race([fetchPromise, timeoutPromise]));
                const responseText = result.response?.text();
                if (responseText) {
                    return responseText;
                }
            }
            return this.getFallbackAssistantResponse(userPrompt);
        }
        catch (err) {
            const errMsg = err?.message || String(err);
            if (errMsg.includes('Timeout')) {
                this.logError(AiErrorCode.AI_TIMEOUT, `Provider request timed out after ${timeoutMs}ms: ${errMsg}`);
            }
            else if (errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('API_KEY_INVALID')) {
                this.logError(AiErrorCode.AI_AUTH_ERROR, `AI Provider API Key authentication failed: ${errMsg}`);
            }
            else if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
                this.logError(AiErrorCode.AI_RATE_LIMIT, `AI Provider rate limit / quota exceeded: ${errMsg}`);
            }
            else {
                this.logError(AiErrorCode.AI_PROVIDER_ERROR, `AI Provider error occurred (${provider}/${modelName}): ${errMsg}`, err.stack);
            }
            return this.getFallbackAssistantResponse(userPrompt);
        }
    }
    getFallbackAssistantResponse(userPrompt) {
        return `Based on your query ("${userPrompt}"), here is general health guidance: Ensure adequate hydration, rest well, and monitor any symptoms carefully. If symptoms persist or worsen over the next 24-48 hours, please consult a verified specialist doctor on Gippo.uz for personalized medical evaluation.`;
    }
    logError(code, details, stack) {
        this.logger.error(`[${code}] ${details}`, stack);
    }
    async getUserConversations(userId) {
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
    async getConversationById(conversationId, userId) {
        const conv = await this.prisma.aIConversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!conv) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conv.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return conv;
    }
};
exports.AiService = AiService;
AiService.SYSTEM_INSTRUCTION = `
You are the Gippo.uz AI Health Assistant. 
STRICT CLINICAL & SAFETY GUIDELINES:
1. You are an AI medical assistant, NOT a licensed medical doctor. Never claim to be a doctor.
2. Do NOT provide definitive medical diagnoses or prescribe dangerous drugs/treatments.
3. Encourage users to consult qualified doctors on Gippo.uz when appropriate.
4. Detect potential emergency situations (chest pain, shortness of breath, severe bleeding, sudden loss of consciousness, stroke symptoms). If detected, IMMEDIATELY instruct the user to call emergency medical services (103) or go to the nearest emergency room.
5. Clearly explain uncertainty and protect user privacy.
`;
AiService.MEDICAL_DISCLAIMER = `

---
*Disclaimer: Gippo AI is an informational tool and does NOT replace professional medical advice, diagnosis, or treatment. Always consult a verified doctor for health concerns. In case of emergency, call 103 immediately.*`;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map