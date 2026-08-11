'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role } from '@/types';
import { appointmentsService } from '@/services/appointments';
import { formatDate, formatCurrency } from '@/lib/cn';
import { Calendar, Video, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AppointmentsPage() {
  return (
    <RoleGuard allowedRoles={[Role.PATIENT, Role.DOCTOR]}>
      <AppointmentsContent />
    </RoleGuard>
  );
}

function AppointmentsContent() {
  const queryClient = useQueryClient();

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
        <h1 className="text-2xl font-black text-slate-900">Mening Qabullarim (Appointments)</h1>
        <p className="text-xs text-slate-500 mt-1">Barcha bron qilingan va o'tkazilgan online konsultatsiyalar ro'yxati</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Sizda hozircha qabullar mavjud emas</h3>
          <Link
            href="/doctors"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white gradient-teal shadow-md"
          >
            Shifokorga yozilish
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const docName = apt.doctorProfile?.user
              ? `${apt.doctorProfile.user.firstName} ${apt.doctorProfile.user.lastName}`
              : 'Shifokor';
            return (
              <div
                key={apt.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Dr. {docName}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        apt.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'CONFIRMED'
                          ? 'bg-teal-100 text-teal-800'
                          : apt.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <strong>Vaqti:</strong> {formatDate(apt.startTime)}
                  </p>
                  <p className="text-xs text-slate-500">
                    To'lov statusi: <strong className="text-slate-800">{apt.paymentStatus}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-slate-900">{formatCurrency(apt.price)}</span>

                  {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => cancelMutation.mutate(apt.id)}
                      disabled={cancelMutation.isPending}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100"
                    >
                      Bekor qilish
                    </button>
                  )}

                  <Link
                    href={`/consultations?appointmentId=${apt.id}`}
                    className="px-4 py-2.5 rounded-xl font-bold text-white gradient-teal text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4" />
                    Video Xonaga Kirish
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
