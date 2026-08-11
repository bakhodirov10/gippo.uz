import { AvailabilityService } from './availability.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    getDoctorAvailability(doctorProfileId: string): Promise<{
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDurationMinutes: number;
        isAvailable: boolean;
        doctorProfileId: string;
    }[]>;
    setDoctorAvailability(userId: string, dto: SetAvailabilityDto): Promise<{
        message: string;
        count: number;
    }>;
}
