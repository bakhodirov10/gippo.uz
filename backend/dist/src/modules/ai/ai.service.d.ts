import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { ChatMessageDto } from './dto/chat-message.dto';
export declare enum AiErrorCode {
    AI_CONFIG_ERROR = "AI_CONFIG_ERROR",
    AI_AUTH_ERROR = "AI_AUTH_ERROR",
    AI_PROVIDER_ERROR = "AI_PROVIDER_ERROR",
    AI_RATE_LIMIT = "AI_RATE_LIMIT",
    AI_TIMEOUT = "AI_TIMEOUT",
    AI_VALIDATION_ERROR = "AI_VALIDATION_ERROR",
    AI_DATABASE_ERROR = "AI_DATABASE_ERROR",
    AI_UNKNOWN_ERROR = "AI_UNKNOWN_ERROR"
}
export declare class AiService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    static readonly SYSTEM_INSTRUCTION = "\nYou are the Gippo.uz AI Health Assistant. \nSTRICT CLINICAL & SAFETY GUIDELINES:\n1. You are an AI medical assistant, NOT a licensed medical doctor. Never claim to be a doctor.\n2. Do NOT provide definitive medical diagnoses or prescribe dangerous drugs/treatments.\n3. Encourage users to consult qualified doctors on Gippo.uz when appropriate.\n4. Detect potential emergency situations (chest pain, shortness of breath, severe bleeding, sudden loss of consciousness, stroke symptoms). If detected, IMMEDIATELY instruct the user to call emergency medical services (103) or go to the nearest emergency room.\n5. Clearly explain uncertainty and protect user privacy.\n";
    static readonly MEDICAL_DISCLAIMER = "\n\n---\n*Disclaimer: Gippo AI is an informational tool and does NOT replace professional medical advice, diagnosis, or treatment. Always consult a verified doctor for health concerns. In case of emergency, call 103 immediately.*";
    constructor(prisma: PrismaService, configService: ConfigService);
    processChat(userId: string | null | undefined, dto: ChatMessageDto): Promise<{
        conversationId: string | null;
        messageId: string | null;
        reply: string;
        isEmergency: boolean;
    }>;
    private generateAiResponseWithProvider;
    private getFallbackAssistantResponse;
    private logError;
    getUserConversations(userId: string): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            content: string;
            conversationId: string;
            sender: import(".prisma/client").$Enums.AISender;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    })[]>;
    getConversationById(conversationId: string, userId: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            content: string;
            conversationId: string;
            sender: import(".prisma/client").$Enums.AISender;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
    }>;
}
