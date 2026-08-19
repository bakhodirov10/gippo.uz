'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role } from '@/types';
import { appointmentsService } from '@/services/appointments';
import { formatDate, formatCurrency } from '@/lib/cn';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Calendar, Video, Clock, Loader2 } from 'lucide-react';
import { SkeletonAppointmentCard } from '@/components/ui/skeletons';

export default function AppointmentsPage() {
  return (
    <RoleGuard allowedRoles={[Role.PATIENT, Role.DOCTOR]}>
      <AppointmentsContent />
    </RoleGuard>
  );
}

function AppointmentsContent() {
  const queryClient = useQueryClient();
  const { t } = useLanguageStore();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['user-appointments'],
    queryFn: () => appointmentsService.getUserAppointments(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.appointments.title}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.appointments.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonAppointmentCard key={i} />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{t.appointments.emptyState}</h3>
          <Link
            href="/doctors"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white gradient-teal shadow-md"
          >
            {t.appointments.bookDoctor}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const docName = apt.doctorProfile?.user
              ? `${apt.doctorProfile.user.firstName} ${apt.doctorProfile.user.lastName}`
              : 'Shifokor';
            const isCancelling = cancelMutation.isPending && cancelMutation.variables === apt.id;
            const localizedStatus = t.status[apt.status as keyof typeof t.status] || apt.status;
            const localizedPaymentStatus = t.status[apt.paymentStatus as keyof typeof t.status] || apt.paymentStatus;

            return (
              <div
                key={apt.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Dr. {docName}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        apt.status === 'COMPLETED'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : apt.status === 'CONFIRMED'
                          ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                          : apt.status === 'CANCELLED'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {localizedStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <strong>{t.appointments.time}</strong> {formatDate(apt.startTime)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.appointments.paymentStatus} <strong className="text-slate-800 dark:text-slate-200">{localizedPaymentStatus}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">{formatCurrency(apt.price)}</span>

                  {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => cancelMutation.mutate(apt.id)}
                      disabled={cancelMutation.isPending}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      {isCancelling ? t.appointments.cancelling : t.appointments.cancelBtn}
                    </button>
                  )}

                  <Link
                    href={`/consultations?appointmentId=${apt.id}`}
                    className="px-4 py-2.5 rounded-xl font-bold text-white gradient-teal text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4" />
                    {t.appointments.enterRoom}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
