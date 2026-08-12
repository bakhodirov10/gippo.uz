'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role, DoctorProfile, DoctorStatus } from '@/types';
import { adminService } from '@/services/admin';
import { doctorsService } from '@/services/doctors';
import { formatCurrency, formatDate } from '@/lib/cn';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { SkeletonDoctorCard } from '@/components/ui/skeletons';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}>
      <AdminDashboardContent />
    </RoleGuard>
  );
}

function AdminDashboardContent() {
  const queryClient = useQueryClient();
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'DOCTOR_APPLICATIONS' | 'USERS' | 'AUDIT_LOGS'>('DOCTOR_APPLICATIONS');

  // Selected doctor application for review modal
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch Admin analytics
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics(),
  });

  // Fetch pending doctor applications
  const { data: pendingDoctors = [], isLoading: isPendingLoading } = useQuery({
    queryKey: ['admin-pending-doctors'],
    queryFn: () => doctorsService.getPendingApplications(),
  });

  // Doctor review mutation (Approve/Reject)
  const reviewMutation = useMutation({
    mutationFn: (payload: { doctorId: string; status: DoctorStatus; rejectionReason?: string; notes?: string }) =>
      doctorsService.reviewDoctorApplication(payload.doctorId, {
        status: payload.status,
        rejectionReason: payload.rejectionReason,
        notes: payload.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      setSelectedDoctor(null);
      setRejectionReason('');
      setAdminNotes('');
    },
  });

  const handleReviewAction = (status: DoctorStatus) => {
    if (!selectedDoctor) return;
    reviewMutation.mutate({
      doctorId: selectedDoctor.id,
      status,
      rejectionReason: status === DoctorStatus.REJECTED ? rejectionReason : undefined,
      notes: adminNotes,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold border border-teal-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black">{t.admin.title}</h1>
            <p className="text-xs text-slate-400">{t.admin.subtitle}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'DOCTOR_APPLICATIONS', label: `${t.admin.tabApplications} (${pendingDoctors.length})` },
            { id: 'ANALYTICS', label: t.admin.tabAnalytics },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: DOCTOR APPLICATIONS APPROVAL PAGE */}
      {activeTab === 'DOCTOR_APPLICATIONS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {t.admin.pendingTitle}
            </h2>
          </div>

          {isPendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonDoctorCard key={i} />
              ))}
            </div>
          ) : pendingDoctors.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{t.admin.noPending}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.admin.noPendingDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingDoctors.map((doc) => {
                const fullName = doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : 'Shifokor';
                return (
                  <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-lg">
                        {fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dr. {fullName}</h4>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{t.doctors.licenseNumber} {doc.licenseNumber}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          {t.status.PENDING}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <p>
                        <strong>{t.doctors.experience}:</strong> {doc.experienceYears} {t.doctors.years}
                      </p>
                      <p>
                        <strong>{t.doctors.fee}:</strong> {formatCurrency(doc.consultationFee)}
                      </p>
                      <p className="truncate">
                        <strong>Email:</strong> {doc.user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedDoctor(doc)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      {t.admin.viewDetails}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: ANALYTICS & 95/5 REVENUE SPLIT */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.admin.grossVolume}</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {formatCurrency(analytics?.financials.totalGrossVolume || 0)}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">{t.admin.platformRevenue}</span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block">
                {formatCurrency(analytics?.financials.totalPlatformRevenue || 0)}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.admin.doctorPayouts}</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-200 block">
                {formatCurrency(analytics?.financials.totalDoctorPayouts || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR APPLICATION REVIEW MODAL */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName} - {t.admin.reviewModalTitle}
              </h3>
              <button onClick={() => setSelectedDoctor(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <strong>{t.admin.licenseNumberLabel}</strong> {selectedDoctor.licenseNumber}
                </p>
                <p>
                  <strong>{t.admin.experienceYearsLabel}</strong> {selectedDoctor.experienceYears} {t.doctors.years}
                </p>
                <p>
                  <strong>Email:</strong> {selectedDoctor.user?.email}
                </p>
                <p>
                  <strong>{t.doctors.fee}:</strong> {formatCurrency(selectedDoctor.consultationFee)}
                </p>
              </div>
              {selectedDoctor.bio && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <strong>Bio:</strong> {selectedDoctor.bio}
                </div>
              )}
            </div>

            {/* Rejection Reason field */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t.admin.rejectionReasonLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.admin.rejectionPlaceholder}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t.admin.adminNotesLabel}
                </label>
                <input
                  type="text"
                  placeholder="..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleReviewAction(DoctorStatus.REJECTED)}
                disabled={reviewMutation.isPending}
                className="w-1/2 py-3 rounded-xl font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs hover:bg-rose-100 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {reviewMutation.isPending && reviewMutation.variables?.status === DoctorStatus.REJECTED ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {reviewMutation.isPending && reviewMutation.variables?.status === DoctorStatus.REJECTED
                  ? t.admin.rejecting
                  : t.admin.rejectBtn}
              </button>
              <button
                onClick={() => handleReviewAction(DoctorStatus.APPROVED)}
                disabled={reviewMutation.isPending}
                className="w-1/2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {reviewMutation.isPending && reviewMutation.variables?.status === DoctorStatus.APPROVED ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {reviewMutation.isPending && reviewMutation.variables?.status === DoctorStatus.APPROVED
                  ? t.admin.approving
                  : t.admin.approveBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
