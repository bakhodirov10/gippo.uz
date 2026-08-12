'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { appointmentsService } from '@/services/appointments';
import { SkeletonDashboard } from '@/components/ui/skeletons';
import { formatDate, formatCurrency } from '@/lib/cn';
import {
  Calendar,
  Video,
  Bot,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function PatientDashboardPage() {
  return (
    <RoleGuard allowedRoles={[Role.PATIENT]}>
      <PatientDashboardContent />
    </RoleGuard>
  );
}

function PatientDashboardContent() {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: () => appointmentsService.getUserAppointments(),
  });

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-teal text-white flex items-center justify-center font-black text-xl shadow-md">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.dashboard.welcome} {user?.firstName} {user?.lastName}!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.dashboard.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/doctors"
            className="px-4 py-3 rounded-xl font-bold text-xs text-white gradient-teal shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.dashboard.newBooking}
          </Link>
          <Link
            href="/ai"
            className="px-4 py-3 rounded-xl font-bold text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {t.dashboard.aiAssistantFree}
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.pendingAppointments}</span>
            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{upcomingAppointments.length}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.dashboard.pendingDesc}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.completedConsultations}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">{completedAppointments.length}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.dashboard.completedDesc}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.dashboard.aiChatTitle}</span>
            <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{t.dashboard.freeText}</span>
          <Link href="/ai" className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline block">
            {t.dashboard.startChat}
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            {t.dashboard.upcomingTitle}
          </h3>
          <Link href="/appointments" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
            {t.dashboard.viewAll}
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.dashboard.noUpcoming}</p>
            <Link href="/doctors" className="inline-block text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
              {t.dashboard.goToDoctors}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((apt) => {
              const docName = apt.doctorProfile?.user
                ? `${apt.doctorProfile.user.firstName} ${apt.doctorProfile.user.lastName}`
                : 'Shifokor';
              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dr. {docName}</h4>
                    <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(apt.startTime)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatCurrency(apt.price)}</span>
                    <Link
                      href={`/consultations?appointmentId=${apt.id}`}
                      className="px-4 py-2 rounded-xl font-bold text-white gradient-teal text-xs shadow-md flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      {t.dashboard.enterRoom}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
