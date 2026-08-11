import { PrismaService } from '../../database/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
}
