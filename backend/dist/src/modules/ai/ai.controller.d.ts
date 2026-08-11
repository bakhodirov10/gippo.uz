import { AiService } from './ai.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JwtPayloadUser } from '../../common/decorators/current-user.decorator';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    chat(user: JwtPayloadUser | undefined, dto: ChatMessageDto): Promise<{
        conversationId: string | null;
        messageId: string | null;
        reply: string;
        isEmergency: boolean;
    }>;
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
    getConversationById(id: string, userId: string): Promise<{
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
