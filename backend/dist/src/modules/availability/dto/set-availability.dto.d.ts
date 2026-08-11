export declare class AvailabilityItemDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    isAvailable?: boolean;
}
export declare class SetAvailabilityDto {
    availabilities: AvailabilityItemDto[];
}
