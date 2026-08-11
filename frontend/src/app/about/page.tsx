'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, ShieldCheck, HeartPulse, Award, Bot, Lock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-3xl gradient-teal text-white flex items-center justify-center mx-auto shadow-lg">
          <Stethoscope className="w-9 h-9" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gippo.uz Haqida</h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Gippo.uz — O'zbekistonda sog'liqni saqlash sohasida zamonaviy raqamli texnologiyalar va sun'iy intellektni birlashtirgan yetakchi health-tech marketplace platformasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <ShieldCheck className="w-8 h-8 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-base">Litsenziyalangan Shifokorlar</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Platformada faoliyat yurituvchi barcha vrachlarning tibbiy ma'lumoti va litsenziyalari ekspertlar tomonidan sinchkovlik bilan tekshiriladi.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <Award className="w-8 h-8 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-base">95% / 5% Shaffof Split</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Konsultatsiya haqining 95% qismi bevosita shifokorga yetkaziladi va backend darajasida immutable ledger orqali hisoblanadi.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <Bot className="w-8 h-8 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-base">Bepul AI Assistent</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Har bir foydalanuvchi bepul sun'iy intellekt yordamchisidan foydalanib dastlabki tibbiy ma'lumot olishi va tez yordam alomatlarini tekshirishi mumkin.
          </p>
        </div>
      </div>
    </div>
  );
}
