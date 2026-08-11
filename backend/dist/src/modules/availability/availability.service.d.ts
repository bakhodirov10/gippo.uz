import { PrismaService } from '../../database/prisma.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
export declare class AvailabilityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    setDoctorAvailability(userId: string, dto: SetAvailabilityDto): Promise<{
        message: string;
        count: number;
    }>;
    getDoctorAvailability(doctorProfileId: string): Promise<{
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDurationMinutes: number;
        isAvailable: boolean;
        doctorProfileId: string;
    }[]>;
}
