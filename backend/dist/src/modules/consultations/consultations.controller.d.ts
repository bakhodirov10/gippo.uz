import { ConsultationsService } from './consultations.service';
export declare class ConsultationsController {
    private readonly consultationsService;
    constructor(consultationsService: ConsultationsService);
    getSessionToken(appointmentId: string, userId: string): Promise<{
        consultationId: string;
        roomName: string;
        token: string;
        isDoctor: boolean;
        status: import(".prisma/client").$Enums.ConsultationStatus;
    }>;
}
