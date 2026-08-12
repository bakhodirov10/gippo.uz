'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Stethoscope, ShieldCheck, HeartPulse, Award, Users, Bot } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguageStore();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl gradient-teal text-white flex items-center justify-center mx-auto shadow-lg">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t.about.title}</h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.about.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{t.about.missionTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.about.missionDesc}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{t.about.verifiedTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.about.verifiedDesc}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{t.about.aiTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.about.aiDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
