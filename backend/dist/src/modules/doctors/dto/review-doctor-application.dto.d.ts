import { DoctorStatus } from '@prisma/client';
export declare class ReviewDoctorApplicationDto {
    status: DoctorStatus;
    reason?: string;
    notes?: string;
}
