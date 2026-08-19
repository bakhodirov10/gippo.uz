import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AppointmentStatus, DoctorStatus, PaymentStatus, Role } from '@prisma/client';
import Decimal from 'decimal.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformAnalytics() {
    const [
      totalUsers,
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      totalAppointments,
      completedConsultations,
      aiConversations,
      payments,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.PATIENT } }),
      this.prisma.doctorProfile.count(),
      this.prisma.doctorProfile.count({
        where: { verificationStatus: DoctorStatus.PENDING },
      }),
      this.prisma.doctorProfile.count({
        where: { verificationStatus: DoctorStatus.APPROVED },
      }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: { status: AppointmentStatus.COMPLETED },
      }),
      this.prisma.aIConversation.count(),
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.PAID },
        select: {
          grossAmount: true,
          platformFee: true,
          doctorAmount: true,
        },
      }),
    ]);

    let totalRevenue = new Decimal(0);
    let platformRevenue = new Decimal(0);
    let doctorEarnings = new Decimal(0);

    for (const p of payments) {
      totalRevenue = totalRevenue.add(new Decimal(p.grossAmount));
      platformRevenue = platformRevenue.add(new Decimal(p.platformFee));
      doctorEarnings = doctorEarnings.add(new Decimal(p.doctorAmount));
    }

    return {
      users: {
        totalPatients: totalUsers,
        totalDoctors,
        pendingDoctors,
        approvedDoctors,
      },
      appointments: {
        totalAppointments,
        completedConsultations,
      },
      financials: {
        totalRevenue: totalRevenue.toFixed(2),
        platformRevenue: platformRevenue.toFixed(2),
        doctorEarnings: doctorEarnings.toFixed(2),
        currency: 'UZS',
      },
      aiUsage: {
        totalConversations: aiConversations,
      },
    };
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
