'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Stethoscope, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const { t } = useLanguageStore();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-lg">
        <Stethoscope className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {t.common.notFound}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {t.common.notFoundDesc}
        </p>
      </div>

      <Link
        href="/"
        className="px-6 py-3 rounded-2xl font-bold text-xs text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 transition-opacity inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.common.goHome}</span>
      </Link>
    </div>
  );
}
