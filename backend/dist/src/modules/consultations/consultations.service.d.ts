import { PrismaService } from '../../database/prisma.service';
import { MockVideoProvider } from './providers/mock-video.provider';
export declare class ConsultationsService {
    private readonly prisma;
    private readonly videoProvider;
    constructor(prisma: PrismaService, videoProvider: MockVideoProvider);
    getSessionToken(appointmentId: string, userId: string): Promise<{
        consultationId: string;
        roomName: string;
        token: string;
        isDoctor: boolean;
        status: import(".prisma/client").$Enums.ConsultationStatus;
    }>;
}
