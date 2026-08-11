'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role, DoctorProfile, DoctorStatus } from '@/types';
import { adminService } from '@/services/admin';
import { doctorsService } from '@/services/doctors';
import { formatCurrency, formatDate } from '@/lib/cn';
import {
  ShieldCheck,
  Users,
  Building2,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Bot,
  Activity,
  Loader2,
  Search,
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
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'DOCTOR_APPLICATIONS' | 'USERS' | 'AUDIT_LOGS'>('DOCTOR_APPLICATIONS');

  // Selected doctor application for review modal
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch Admin analytics
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics(),
  });

  // Fetch pending doctor applications
  const { data: pendingDoctors = [], isLoading: isPendingLoading } = useQuery({
    queryKey: ['admin-pending-doctors'],
    queryFn: () => doctorsService.getPendingApplications(),
  });

  // Fetch all users
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getAllUsers(),
    enabled: activeTab === 'USERS',
  });

  // Fetch audit logs
  const { data: auditLogsData } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminService.getAuditLogs(),
    enabled: activeTab === 'AUDIT_LOGS',
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
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold border border-teal-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black">Gippo.uz Admin Portal</h1>
            <p className="text-xs text-slate-400">Platforma operatsiyalari, shifokorlarni tasdiqlash va 95/5 daromad analitikasi</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'DOCTOR_APPLICATIONS', label: `Pending Arizalar (${pendingDoctors.length})` },
            { id: 'ANALYTICS', label: 'Moliyaviy Analitika' },
            { id: 'USERS', label: 'Foydalanuvchilar' },
            { id: 'AUDIT_LOGS', label: 'Audit Loglar' },
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
            <h2 className="text-lg font-extrabold text-slate-900">
              Shifokor Arizalarini Ko'rib Chiqish (Pending Applications)
            </h2>
          </div>

          {isPendingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
          ) : pendingDoctors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">Hozircha kutilayotgan arizalar yo'q</h3>
              <p className="text-xs text-slate-500">Barcha shifokor arizalari ko'rib chiqilgan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingDoctors.map((doc) => {
                const fullName = doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : 'Shifokor';
                return (
                  <div key={doc.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg">
                        {fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Dr. {fullName}</h4>
                        <p className="text-xs text-teal-600 font-semibold">Litsenziya: {doc.licenseNumber}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          PENDING
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t pt-3">
                      <p>
                        <strong>Tajriba:</strong> {doc.experienceYears} yil
                      </p>
                      <p>
                        <strong>Konsultatsiya narxi:</strong> {formatCurrency(doc.consultationFee)}
                      </p>
                      <p className="truncate">
                        <strong>Email:</strong> {doc.user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedDoctor(doc)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      Batafsil Ko'rish va Qaror Qabul Qilish
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Brutto Volume</span>
              <span className="text-2xl font-black text-slate-900 block">
                {formatCurrency(analytics?.financials.totalGrossVolume || 0)}
              </span>
              <span className="text-[10px] text-slate-500">Mijozlar tomonidan to'langan summasi</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Gippo Platform Revenue (5%)</span>
              <span className="text-2xl font-black text-teal-600 block">
                {formatCurrency(analytics?.financials.totalPlatformRevenue || 0)}
              </span>
              <span className="text-[10px] text-teal-700 font-semibold">Net platforma daromadi</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shifokorlar Payouti (95%)</span>
              <span className="text-2xl font-black text-slate-800 block">
                {formatCurrency(analytics?.financials.totalDoctorPayouts || 0)}
              </span>
              <span className="text-[10px] text-slate-500">Shifokorlar balansiga o'tkazilgan</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Konsultatsiyalar</span>
              <span className="text-2xl font-black text-slate-900 block">
                {analytics?.completedAppointments || 0} / {analytics?.totalAppointments || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Yakunlangan qabullar</span>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR APPLICATION REVIEW MODAL */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="border-b pb-4 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900">
                Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName} - Arizasi
              </h3>
              <button onClick={() => setSelectedDoctor(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <strong>Litsenziya:</strong> {selectedDoctor.licenseNumber}
                </p>
                <p>
                  <strong>Tajriba:</strong> {selectedDoctor.experienceYears} yil
                </p>
                <p>
                  <strong>Email:</strong> {selectedDoctor.user?.email}
                </p>
                <p>
                  <strong>Telefon:</strong> {selectedDoctor.user?.phone || 'Biriktirilmagan'}
                </p>
                <p>
                  <strong>Konsultatsiya narxi:</strong> {formatCurrency(selectedDoctor.consultationFee)}
                </p>
                <p>
                  <strong>Ta'lim:</strong> {selectedDoctor.education || 'Kiritilmagan'}
                </p>
              </div>
              {selectedDoctor.bio && (
                <div className="pt-2 border-t">
                  <strong>Bio:</strong> {selectedDoctor.bio}
                </div>
              )}
            </div>

            {/* Rejection Reason field */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rad etish Sababi (Reject holati uchun)
                </label>
                <input
                  type="text"
                  placeholder="Litsenziya hujjati tasdiqlanmadi..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Qaydlar (Audit Log)
                </label>
                <input
                  type="text"
                  placeholder="Litsenziya reyestri tekshirildi..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleReviewAction(DoctorStatus.REJECTED)}
                disabled={reviewMutation.isPending}
                className="w-1/2 py-3 rounded-xl font-bold text-rose-700 bg-rose-50 border border-rose-200 text-xs hover:bg-rose-100 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Rad Etish (Reject)
              </button>
              <button
                onClick={() => handleReviewAction(DoctorStatus.APPROVED)}
                disabled={reviewMutation.isPending}
                className="w-1/2 py-3 rounded-xl font-bold text-white bg-emerald-600 text-xs hover:bg-emerald-700 shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Tasdiqlash (Approve)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
