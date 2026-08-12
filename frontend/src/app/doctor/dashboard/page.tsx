'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role, DoctorStatus } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { ledgerService } from '@/services/ledger';
import { appointmentsService } from '@/services/appointments';
import { formatCurrency, formatDate } from '@/lib/cn';
import {
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  Wallet,
  Star,
  Loader2,
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
  const { t } = useLanguageStore();
  const queryClient = useQueryClient();

  const doctorProfile = user?.doctorProfile;
  const status = doctorProfile?.verificationStatus || DoctorStatus.PENDING;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SCHEDULE' | 'APPOINTMENTS' | 'EARNINGS'>('OVERVIEW');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Fetch doctor earnings & ledger
  const { data: ledger } = useQuery({
    queryKey: ['doctor-ledger'],
    queryFn: () => ledgerService.getDoctorLedger(),
    enabled: status === DoctorStatus.APPROVED,
  });

  // Fetch doctor appointments
  const { data: appointments = [] } = useQuery({
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-teal text-white flex items-center justify-center font-black text-xl shadow-md">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Dr. {user?.firstName} {user?.lastName}
              </h1>
              {status === DoctorStatus.APPROVED ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  ✓ {t.status.APPROVED}
                </span>
              ) : status === DoctorStatus.REJECTED ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  ✖ {t.status.REJECTED}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                  ⏳ {t.status.PENDING}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.doctor.licenseLabel} {doctorProfile?.licenseNumber || t.doctor.inVerification} | {t.doctor.portalSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['OVERVIEW', 'APPOINTMENTS', 'SCHEDULE', 'EARNINGS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab === 'OVERVIEW'
                ? t.doctor.tabOverview
                : tab === 'APPOINTMENTS'
                ? t.doctor.tabAppointments
                : tab === 'SCHEDULE'
                ? t.doctor.tabSchedule
                : t.doctor.tabEarnings}
            </button>
          ))}
        </div>
      </div>

      {/* PENDING VERIFICATION WARNING BANNER */}
      {!isApproved && (
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 shadow-sm flex items-start gap-4 transition-colors">
          <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-amber-900 dark:text-amber-200 text-base">{t.doctor.pendingBannerTitle}</h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              {t.doctor.pendingBannerDesc}
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">{t.doctor.totalEarnings}</span>
                <Wallet className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {formatCurrency(ledger?.totalEarnings || 0)}
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{t.doctor.afterCommission}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">{t.doctor.availableBalance}</span>
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                {formatCurrency(ledger?.availableBalance || 0)}
              </span>
              {isApproved && (
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  {t.doctor.withdrawBtn} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">{t.doctor.pendingHold}</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">
                {formatCurrency(ledger?.pendingBalance || 0)}
              </span>
              <span className="text-[10px] text-slate-400">{t.doctor.holdNotice}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">{t.doctor.ratingsAndReviews}</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {doctorProfile?.averageRating ? Number(doctorProfile.averageRating).toFixed(1) : '5.0'} ⭐
              </span>
              <span className="text-[10px] text-slate-400">{doctorProfile?.totalReviews || 0} {t.doctors.reviewsCount}</span>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {t.appointments.title}
            </h3>

            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t.appointments.emptyState}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                      <th className="pb-3">Patient</th>
                      <th className="pb-3">{t.common.date} & {t.common.time}</th>
                      <th className="pb-3">{t.common.price}</th>
                      <th className="pb-3">{t.common.status}</th>
                      <th className="pb-3">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {appointments.map((apt) => {
                      const localizedStatus = t.status[apt.status as keyof typeof t.status] || apt.status;
                      return (
                        <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                            {apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Patient'}
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">{formatDate(apt.startTime)}</td>
                          <td className="py-3 font-extrabold text-slate-900 dark:text-white">{formatCurrency(apt.price)}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                apt.status === 'COMPLETED'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : apt.status === 'CONFIRMED'
                                  ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {localizedStatus}
                            </span>
                          </td>
                          <td className="py-3">
                            {apt.status === 'CONFIRMED' && (
                              <button
                                onClick={() => completeMutation.mutate(apt.id)}
                                disabled={completeMutation.isPending}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                              >
                                {t.doctor.completeConsultation}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.doctor.withdrawModalTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.doctor.availableBalance}: <strong>{formatCurrency(ledger?.availableBalance || 0)}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.doctor.withdrawAmountLabel}</label>
              <input
                type="number"
                step={50000}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-1/3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => withdrawMutation.mutate(withdrawAmount)}
                disabled={withdrawMutation.isPending}
                className="w-2/3 py-2.5 rounded-xl text-xs font-bold text-white gradient-teal shadow-md"
              >
                {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
