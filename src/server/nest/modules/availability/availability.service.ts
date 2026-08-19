import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async setDoctorAvailability(userId: string, dto: SetAvailabilityDto) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    // Replace old availabilities with new set in transaction
    return this.prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({
        where: { doctorProfileId: doctorProfile.id },
      });

      const created = await tx.availability.createMany({
        data: dto.availabilities.map((item) => ({
          doctorProfileId: doctorProfile.id,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          slotDurationMinutes: item.slotDurationMinutes,
          isAvailable: item.isAvailable ?? true,
        })),
      });

      return {
        message: 'Availability updated successfully',
        count: created.count,
      };
    });
  }

  async getDoctorAvailability(doctorProfileId: string) {
    const availabilities = await this.prisma.availability.findMany({
      where: { doctorProfileId, isAvailable: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return availabilities;
  }
}
