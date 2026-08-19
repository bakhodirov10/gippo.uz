import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class LedgerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getDoctorLedger(doctorUserId: string) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    const ledger = await this.prisma.doctorLedger.findUnique({
      where: { doctorProfileId: doctorProfile.id },
      include: {
        ledgerEntries: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ledger) {
      throw new NotFoundException('Doctor ledger not found');
    }

    return ledger;
  }

  async requestWithdrawal(doctorUserId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be positive');
    }

    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    const ledger = await this.prisma.doctorLedger.findUnique({
      where: { doctorProfileId: doctorProfile.id },
    });

    if (!ledger) {
      throw new NotFoundException('Doctor ledger not found');
    }

    const currentAvailable = Number(ledger.availableBalance);
    if (currentAvailable < amount) {
      throw new BadRequestException(
        `Insufficient available balance. Available: ${currentAvailable} UZS`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const newAvailable = currentAvailable - amount;
      const newWithdrawn = Number(ledger.totalWithdrawn) + amount;

      const updatedLedger = await tx.doctorLedger.update({
        where: { id: ledger.id },
        data: {
          availableBalance: newAvailable,
          totalWithdrawn: newWithdrawn,
        },
      });

      await tx.ledgerEntry.create({
        data: {
          ledgerId: ledger.id,
          type: 'DEBIT_WITHDRAWAL',
          amount,
          balanceAfter: newAvailable,
          description: `Payout withdrawal request for ${amount} UZS`,
        },
      });

      await this.auditLogsService.log({
        actorId: doctorUserId,
        action: 'DOCTOR_WITHDRAWAL_REQUESTED',
        entity: 'DoctorLedger',
        entityId: ledger.id,
        metadata: { amount },
      });

      return {
        message: 'Withdrawal processed successfully',
        ledger: updatedLedger,
      };
    });
  }
}
