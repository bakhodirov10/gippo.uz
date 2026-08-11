'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl max-w-md w-full space-y-6">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-600">
          <ArrowLeft className="w-4 h-4" /> Kirish sahifasiga qaytish
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Parolni Tiklash</h1>
          <p className="text-xs text-slate-500">
            Akkountingizga bog'langan email manzilni kiriting. Biz sizga tiklash havolasini yuboramiz.
          </p>
        </div>

        {isSent ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Havola Yuborildi!</h3>
            <p className="text-xs text-slate-600">
              <strong>{email}</strong> manziliga parolni tiklash bo'yicha ko'rsatma yuborildi. Iltimos, pochtangizni tekshiring.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Manzil</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="bemor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 text-xs"
            >
              Tiklash Havolasini Yuborish
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
