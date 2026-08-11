'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role, DoctorStatus } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { ledgerService } from '@/services/ledger';
import { availabilityService } from '@/services/availability';
import { appointmentsService } from '@/services/appointments';
import { formatCurrency, formatDate } from '@/lib/cn';
import {
  Building2,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Star,
  Users,
  Video,
  Loader2,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export default function DoctorDashboardPage() {
  return (
    <RoleGuard allowedRoles={[Role.DOCTOR]}>
      <DoctorDashboardContent />
    </RoleGuard>
  );
}

function DoctorDashboardContent() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const doctorProfile = user?.doctorProfile;
  const status = doctorProfile?.verificationStatus || DoctorStatus.PENDING;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SCHEDULE' | 'APPOINTMENTS' | 'EARNINGS'>('OVERVIEW');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Fetch doctor earnings & ledger
  const { data: ledger, isLoading: isLedgerLoading } = useQuery({
    queryKey: ['doctor-ledger'],
    queryFn: () => ledgerService.getDoctorLedger(),
    enabled: status === DoctorStatus.APPROVED,
  });

  // Fetch doctor appointments
  const { data: appointments = [], isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: () => appointmentsService.getUserAppointments(),
  });

  // Mutation for completing appointment
  const completeMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentsService.completeAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-ledger'] });
    },
  });

  // Mutation for withdrawal request
  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => ledgerService.requestWithdrawal(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-ledger'] });
      setIsWithdrawModalOpen(false);
    },
  });

  const isApproved = status === DoctorStatus.APPROVED;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-teal text-white flex items-center justify-center font-black text-xl shadow-md">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">
                Dr. {user?.firstName} {user?.lastName}
              </h1>
              {status === DoctorStatus.APPROVED ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ APPROVED
                </span>
              ) : status === DoctorStatus.REJECTED ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                  ✖ REJECTED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  ⏳ PENDING VERIFICATION
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Litsenziya: {doctorProfile?.licenseNumber || 'Tekshiruvda'} | Litsenziyalangan Shifokor Portali
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['OVERVIEW', 'APPOINTMENTS', 'SCHEDULE', 'EARNINGS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab === 'OVERVIEW'
                ? 'Umumiy'
                : tab === 'APPOINTMENTS'
                ? 'Qabullar'
                : tab === 'SCHEDULE'
                ? 'Jadval'
                : 'Daromad (95%)'}
            </button>
          ))}
        </div>
      </div>

      {/* PENDING VERIFICATION WARNING BANNER */}
      {!isApproved && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200/80 shadow-sm flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-amber-900 text-base">Arizangiz Tekshirilmoqda (Status: PENDING)</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Tibbiy litsenziya hujjatlaringiz Admin ekspertlar tomonidan ko'rib chiqilmoqda. Tasdiqlanmaguningizcha public katalogda ko'rinmaysiz, online qabullar ololmaysiz va moliyaviy amallarni bajara olmaysiz.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Jami Daromad (95%)</span>
                <Wallet className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-2xl font-black text-slate-900 block">
                {formatCurrency(ledger?.totalEarnings || 0)}
              </span>
              <span className="text-[10px] text-teal-600 font-semibold">Gippo 5% ulushi ushlangandan so'ng</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Yechishga Tayyor</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-emerald-600 block">
                {formatCurrency(ledger?.availableBalance || 0)}
              </span>
              {isApproved && (
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"
                >
                  Yechib olish <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Hold (Pending)</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-2xl font-black text-amber-600 block">
                {formatCurrency(ledger?.pendingBalance || 0)}
              </span>
              <span className="text-[10px] text-slate-400">Qabul yakunlangach o'tkaziladi</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Reyting & Sharhlar</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-2xl font-black text-slate-900 block">
                {doctorProfile?.averageRating ? Number(doctorProfile.averageRating).toFixed(1) : '5.0'} ⭐
              </span>
              <span className="text-[10px] text-slate-400">{doctorProfile?.totalReviews || 0} ta bemor sharhi</span>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              So'nggi Konsultatsiyalar
            </h3>

            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Hozircha qabullar mavjud emas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-slate-400 font-bold uppercase">
                      <th className="pb-3">Bemor</th>
                      <th className="pb-3">Sana & Vaqt</th>
                      <th className="pb-3">Summa</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-800">
                          {apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Bemor'}
                        </td>
                        <td className="py-3 text-slate-600">{formatDate(apt.startTime)}</td>
                        <td className="py-3 font-extrabold text-slate-900">{formatCurrency(apt.price)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              apt.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.status === 'CONFIRMED'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {apt.status === 'CONFIRMED' && (
                            <button
                              onClick={() => completeMutation.mutate(apt.id)}
                              disabled={completeMutation.isPending}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700"
                            >
                              Yakunlash (Complete)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WITHDRAWAL MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-lg text-slate-900">Daromadni Yechib Olish</h3>
            <p className="text-xs text-slate-500">
              Mavjud balans: <strong>{formatCurrency(ledger?.availableBalance || 0)}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Summa (UZS)</label>
              <input
                type="number"
                step={50000}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border text-xs font-medium text-slate-800"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-1/3 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => withdrawMutation.mutate(withdrawAmount)}
                disabled={withdrawMutation.isPending}
                className="w-2/3 py-2.5 rounded-xl text-xs font-bold text-white gradient-teal shadow-md"
              >
                {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Tasdiqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
