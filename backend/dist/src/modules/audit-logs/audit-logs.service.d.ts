import { PrismaService } from '../../database/prisma.service';
export interface RecordAuditLogInput {
    actorId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditLogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(input: RecordAuditLogInput): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entity: string;
        entityId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        actorId: string | null;
    }>;
    findAll(page?: number, limit?: number): Promise<{
        items: ({
            actor: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            action: string;
            entity: string;
            entityId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            actorId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
