'use client';

import React from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role } from '@/types';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/cn';

export default function PaymentsPage() {
  return (
    <RoleGuard allowedRoles={[Role.PATIENT]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">To'lovlar Tarixi (Payments)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gippo.uz orqali amalga oshirilgan to'lovlar va kvitansiyalar
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3">
            <CreditCard className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Tranzaksiyalar Ro'yxati</h3>
          </div>

          <div className="p-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-600 font-semibold">
              Barcha to'lovlar 95/5 shaffof split tizimi bo'yicha zudlik bilan ishlanadi.
            </p>
            <p className="text-[11px] text-slate-400">
              Tranzaksiya ma'lumotlari xavfsiz backend ledgerida saqlangan.
            </p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
