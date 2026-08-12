'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role } from '@/types';
import { paymentsService } from '@/services/payments';
import { formatCurrency, formatDate } from '@/lib/cn';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PaymentsHistoryPage() {
  return (
    <RoleGuard allowedRoles={[Role.PATIENT, Role.DOCTOR, Role.ADMIN]}>
      <PaymentsHistoryContent />
    </RoleGuard>
  );
}

function PaymentsHistoryContent() {
  const { t } = useLanguageStore();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['user-payments'],
    queryFn: () => paymentsService.getUserPayments(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.payments.title}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.payments.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{t.payments.noTransactions}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.payments.noTransactionsDesc}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-400 font-bold uppercase">
                  <th className="p-4">{t.payments.transactionId}</th>
                  <th className="p-4">{t.payments.provider}</th>
                  <th className="p-4">{t.payments.amount}</th>
                  <th className="p-4">{t.common.status}</th>
                  <th className="p-4">{t.common.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => {
                  const localizedStatus = t.status[p.status as keyof typeof t.status] || p.status;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">{p.id.slice(0, 12)}...</td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{p.providerName}</td>
                      <td className="p-4 font-extrabold text-slate-900 dark:text-white">{formatCurrency(p.grossAmount)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'PAID'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {p.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {localizedStatus}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{formatDate(p.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
