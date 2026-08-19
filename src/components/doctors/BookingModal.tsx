'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorProfile } from '@/types';
import { appointmentsService } from '@/services/appointments';
import { paymentsService } from '@/services/payments';
import { formatCurrency } from '@/lib/cn';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  Loader2,
  Video,
} from 'lucide-react';

interface BookingModalProps {
  doctor: DoctorProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ doctor, isOpen, onClose }: BookingModalProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { t } = useLanguageStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00');
  const [paymentProvider, setPaymentProvider] = useState<'CLICK' | 'PAYME' | 'STRIPE' | 'MOCK'>('MOCK');
  const [step, setStep] = useState<'SELECT' | 'CONFIRM' | 'PAYMENT' | 'SUCCESS'>('SELECT');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);

  if (!isOpen) return null;

  const fullName = doctor.user ? `${doctor.user.firstName} ${doctor.user.lastName}` : 'Shifokor';

  const timeSlots = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00'];

  const handleProceedToConfirm = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setStep('CONFIRM');
  };

  const handleCreateAppointment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const startTimeIso = new Date(`${selectedDate}T${selectedTimeSlot}:00`).toISOString();
      const endTimeIso = new Date(
        new Date(`${selectedDate}T${selectedTimeSlot}:00`).getTime() + 30 * 60000
      ).toISOString();

      const appointment = await appointmentsService.createAppointment({
        doctorProfileId: doctor.id,
        startTime: startTimeIso,
        endTime: endTimeIso,
      });

      setCreatedAppointmentId(appointment.id);
      setStep('PAYMENT');
    } catch (err: any) {
      setError(err.message || 'Error creating appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    if (!createdAppointmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const payRes = await paymentsService.createPayment({
        appointmentId: createdAppointmentId,
        providerName: paymentProvider,
      });

      if (paymentProvider === 'MOCK') {
        await paymentsService.triggerMockWebhook(payRes.payment.id);
      }

      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Error processing payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center font-bold">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{t.doctors.bookingModalTitle}</h3>
              <p className="text-xs text-teal-400">Dr. {fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'SELECT' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  {t.doctors.selectDate}
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  {t.doctors.availableTimeSlots}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedTimeSlot === slot
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t.doctors.fee}</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(doctor.consultationFee)}
                  </span>
                </div>
                <span className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold bg-teal-100 dark:bg-teal-900/80 px-2.5 py-1 rounded-lg">
                  {t.doctors.duration30min}
                </span>
              </div>

              <button
                onClick={handleProceedToConfirm}
                className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {t.doctors.proceed}
              </button>
            </div>
          )}

          {step === 'CONFIRM' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                {t.doctors.confirmTitle}
              </h4>

              <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t.doctors.doctor}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">Dr. {fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t.doctors.dateTime}</span>
                  <span className="font-bold text-teal-700 dark:text-teal-300">
                    {selectedDate} - {t.doctors.hour} {selectedTimeSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t.doctors.duration}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{t.doctors.durationValue}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{t.doctors.totalPayment}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {formatCurrency(doctor.consultationFee)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('SELECT')}
                  className="w-1/3 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                >
                  {t.common.back}
                </button>
                <button
                  onClick={handleCreateAppointment}
                  disabled={isLoading}
                  className="w-2/3 py-3 rounded-xl font-bold text-white gradient-teal shadow-md hover:opacity-95 text-xs flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.doctors.proceedToPayment}
                </button>
              </div>
            </div>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {t.doctors.selectPaymentProvider}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'CLICK', name: 'Click Pass', color: 'border-cyan-300 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/40' },
                  { id: 'PAYME', name: 'Payme', color: 'border-teal-300 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40' },
                  { id: 'STRIPE', name: 'Visa / MasterCard', color: 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40' },
                  { id: 'MOCK', name: 'Test Sandbox (Instant)', color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentProvider(p.id as any)}
                    className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all ${
                      paymentProvider === p.id
                        ? 'ring-2 ring-teal-600 border-teal-600 bg-teal-50 dark:bg-teal-950/60'
                        : `${p.color} hover:border-slate-300`
                    }`}
                  >
                    <span className="block text-slate-900 dark:text-white">{p.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{t.trust.securePayments}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                💡 <strong>Gippo.uz:</strong> {t.doctors.securePaymentNotice}
              </div>

              <button
                onClick={handlePay}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${formatCurrency(doctor.consultationFee)} ${t.doctors.payButton}`}
              </button>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xl">{t.doctors.paymentSuccessTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.doctors.paymentSuccessDesc}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onClose();
                    router.push('/appointments');
                  }}
                  className="w-full py-3 rounded-xl font-bold text-white gradient-teal text-xs shadow-md"
                >
                  {t.doctors.goToAppointments}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
