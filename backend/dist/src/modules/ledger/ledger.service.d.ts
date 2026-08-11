import { PrismaService } from '../../database/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class LedgerService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    getDoctorLedger(doctorUserId: string): Promise<{
        ledgerEntries: {
            id: string;
            description: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.LedgerEntryType;
            amount: import("@prisma/client/runtime/library").Decimal;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            ledgerId: string;
            paymentId: string | null;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        availableBalance: import("@prisma/client/runtime/library").Decimal;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        totalWithdrawn: import("@prisma/client/runtime/library").Decimal;
        doctorProfileId: string;
    }>;
    requestWithdrawal(doctorUserId: string, amount: number): Promise<{
        message: string;
        ledger: {
            id: string;
            updatedAt: Date;
            totalEarnings: import("@prisma/client/runtime/library").Decimal;
            availableBalance: import("@prisma/client/runtime/library").Decimal;
            pendingBalance: import("@prisma/client/runtime/library").Decimal;
            totalWithdrawn: import("@prisma/client/runtime/library").Decimal;
            doctorProfileId: string;
        };
    }>;
}
