import { AdminService } from './admin.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class AdminController {
    private readonly adminService;
    private readonly auditLogsService;
    constructor(adminService: AdminService, auditLogsService: AuditLogsService);
    getPlatformAnalytics(): Promise<{
        users: {
            totalPatients: number;
            totalDoctors: number;
            pendingDoctors: number;
            approvedDoctors: number;
        };
        appointments: {
            totalAppointments: number;
            completedConsultations: number;
        };
        financials: {
            totalRevenue: string;
            platformRevenue: string;
            doctorEarnings: string;
            currency: string;
        };
        aiUsage: {
            totalConversations: number;
        };
    }>;
    getAllUsers(page?: number, limit?: number): Promise<{
        users: {
            id: string;
            createdAt: Date;
            email: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            firstName: string;
            lastName: string;
            isActive: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAuditLogs(page?: number, limit?: number): Promise<{
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
