import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';
export interface CreateNotificationDto {
    userId: string;
    title: string;
    body: string;
    type?: NotificationType;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
    }>;
    getUserNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
    }[]>;
    markAsRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
