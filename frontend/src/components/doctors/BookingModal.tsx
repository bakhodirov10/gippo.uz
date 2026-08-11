'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorProfile } from '@/types';
import { appointmentsService } from '@/services/appointments';
import { paymentsService } from '@/services/payments';
import { formatCurrency } from '@/lib/cn';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  Loader2,
  ShieldCheck,
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
      setError(err.message || 'Bron qilishda xatolik yuz berdi (Vaqt band bo’lishi mumkin)');
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

      // Simulate webhook payment confirmation for MOCK provider
      if (paymentProvider === 'MOCK') {
        await paymentsService.triggerMockWebhook(payRes.payment.id);
      }

      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'To’lovni amalga oshirishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center font-bold">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Online Konsultatsiya Bron qilish</h3>
              <p className="text-xs text-teal-400">Dr. {fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'SELECT' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Sana Tanlang
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  Mavjud Vaqt Slotlari
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
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Konsultatsiya Narxi</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {formatCurrency(doctor.consultationFee)}
                  </span>
                </div>
                <span className="text-[11px] text-teal-700 font-semibold bg-teal-100 px-2.5 py-1 rounded-lg">
                  30 daqiqa online video
                </span>
              </div>

              <button
                onClick={handleProceedToConfirm}
                className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                Davom etish
              </button>
            </div>
          )}

          {step === 'CONFIRM' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2">
                Qabul Malumotlarini Tasdiqlang
              </h4>

              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Shifokor:</span>
                  <span className="font-bold text-slate-800">Dr. {fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sana va vaqt:</span>
                  <span className="font-bold text-teal-700">
                    {selectedDate} - soat {selectedTimeSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Davomiyligi:</span>
                  <span className="font-medium text-slate-800">30 daqiqa</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="font-bold text-slate-800">Jami To'lov:</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatCurrency(doctor.consultationFee)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('SELECT')}
                  className="w-1/3 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs"
                >
                  Orqaga
                </button>
                <button
                  onClick={handleCreateAppointment}
                  disabled={isLoading}
                  className="w-2/3 py-3 rounded-xl font-bold text-white gradient-teal shadow-md hover:opacity-95 text-xs flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bron qilish & To‘lovga o‘tish'}
                </button>
              </div>
            </div>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-teal-600" />
                To'lov Tizimini Tanlang
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'CLICK', name: 'Click Pass', color: 'border-cyan-300 bg-cyan-50/50' },
                  { id: 'PAYME', name: 'Payme', color: 'border-teal-300 bg-teal-50/50' },
                  { id: 'STRIPE', name: 'Visa / MasterCard', color: 'border-indigo-300 bg-indigo-50/50' },
                  { id: 'MOCK', name: 'Test Sandbox (Instant)', color: 'border-emerald-300 bg-emerald-50/50' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentProvider(p.id as any)}
                    className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all ${
                      paymentProvider === p.id
                        ? 'ring-2 ring-teal-600 border-teal-600 bg-teal-50'
                        : `${p.color} hover:border-slate-300`
                    }`}
                  >
                    <span className="block text-slate-900">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-normal">Xavfsiz to'lov</span>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                💡 <strong>Gippo.uz Xavfsizligi:</strong> To'lovingiz tasdiqlangan taqdirdagina backend transaction ledger'ga yoziladi.
              </div>

              <button
                onClick={handlePay}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${formatCurrency(doctor.consultationFee)} To‘lash`}
              </button>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">To'lov Muvaffaqiyatli Bajarildi!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bron qilgan uchrashuvingiz tasdiqlandi. Belgilangan vaqtda online video konsultatsiyaga kirishingiz mumkin.
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
                  Mening Qabullarim Bo'limiga O'tish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
