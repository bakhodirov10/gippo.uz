import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrencyUtil } from '../../common/utils/currency.util';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { AppointmentPaymentStatus, AppointmentStatus, PaymentStatus, TransactionStatus, TransactionType } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockPaymentProvider: MockPaymentProvider,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPayment(patientUserId: string, dto: CreatePaymentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { doctorProfile: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.patientId !== patientUserId) {
      throw new ForbiddenException('You do not own this appointment');
    }

    if (appointment.paymentStatus === AppointmentPaymentStatus.PAID) {
      throw new BadRequestException('Appointment is already paid');
    }

    // Calculate 95% doctor / 5% platform split using Decimal math
    const { grossAmount, platformFee, doctorAmount } = CurrencyUtil.calculateSplit(
      appointment.price,
    );

    const providerName = dto.providerName || 'MOCK';
    const initResult = await this.mockPaymentProvider.createPayment({
      appointmentId: appointment.id,
      grossAmount: grossAmount.toNumber(),
      currency: 'UZS',
      patientId: patientUserId,
      description: `Medical consultation appointment #${appointment.id.slice(0, 8)}`,
    });

    const payment = await this.prisma.payment.upsert({
      where: { appointmentId: appointment.id },
      create: {
        appointmentId: appointment.id,
        providerPaymentId: initResult.providerPaymentId,
        providerName,
        grossAmount: grossAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        doctorAmount: doctorAmount.toFixed(2),
        currency: 'UZS',
        status: PaymentStatus.PENDING,
      },
      update: {
        providerPaymentId: initResult.providerPaymentId,
        providerName,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentId: payment.id,
      grossAmount: payment.grossAmount,
      platformFee: payment.platformFee,
      doctorAmount: payment.doctorAmount,
      currency: payment.currency,
      status: payment.status,
      paymentUrl: initResult.paymentUrl,
    };
  }

  async handleWebhook(headers: Record<string, any>, body: any) {
    const validation = await this.mockPaymentProvider.verifyWebhook(headers, body);

    if (!validation.isValid) {
      throw new BadRequestException('Invalid webhook signature or payload');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: validation.appointmentId },
      include: { payment: true, doctorProfile: true },
    });

    if (!appointment || !appointment.payment) {
      throw new NotFoundException('Payment or appointment record not found');
    }

    if (appointment.payment.status === PaymentStatus.PAID) {
      return { status: 'SUCCESS', message: 'Payment already processed' };
    }

    // Execute atomic transaction for accounting ledger
    await this.prisma.$transaction(async (tx) => {
      // 1. Update Payment Status
      await tx.payment.update({
        where: { id: appointment.payment!.id },
        data: {
          status: PaymentStatus.PAID,
          rawWebhookPayload: JSON.parse(JSON.stringify(body)),
        },
      });

      // 2. Update Appointment Status
      await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CONFIRMED,
          paymentStatus: AppointmentPaymentStatus.PAID,
        },
      });

      // 3. Create Immutable Transaction Record
      await tx.transaction.create({
        data: {
          paymentId: appointment.payment!.id,
          transactionRef: `tx_ref_${uuidv4().slice(0, 12)}`,
          type: TransactionType.CHARGE,
          amount: appointment.payment!.grossAmount,
          currency: 'UZS',
          status: TransactionStatus.SUCCESS,
        },
      });

      // 4. Update Doctor Ledger (Hold 95% in pendingBalance until consultation is COMPLETED)
      const ledger = await tx.doctorLedger.findUnique({
        where: { doctorProfileId: appointment.doctorProfileId },
      });

      if (ledger) {
        const newPending = Number(ledger.pendingBalance) + Number(appointment.payment!.doctorAmount);

        await tx.doctorLedger.update({
          where: { id: ledger.id },
          data: {
            pendingBalance: newPending,
          },
        });

        await tx.ledgerEntry.create({
          data: {
            ledgerId: ledger.id,
            paymentId: appointment.payment!.id,
            type: 'HOLD_PENDING',
            amount: appointment.payment!.doctorAmount,
            balanceAfter: ledger.availableBalance,
            description: `Pending 95% share credited for Appointment #${appointment.id.slice(0, 8)}`,
          },
        });
      }
    });

    await this.auditLogsService.log({
      action: 'PAYMENT_SUCCESSFUL_WEBHOOK',
      entity: 'Payment',
      entityId: appointment.payment.id,
      metadata: { amount: validation.amount },
    });

    await this.notificationsService.create({
      userId: appointment.patientId,
      title: 'Payment Successful',
      body: `Your payment of ${appointment.price} UZS was confirmed. Appointment is now CONFIRMED.`,
    });

    return { status: 'SUCCESS', message: 'Payment processed successfully' };
  }
}
