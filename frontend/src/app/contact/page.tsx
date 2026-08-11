'use client';

import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Biz Bilan Bog'lanish</h1>
        <p className="text-xs text-slate-500">Savollar yoki takliflaringiz bo'lsa, xabar yuboring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-slate-900 text-white rounded-3xl p-6 space-y-6">
          <h3 className="font-bold text-base border-b border-slate-800 pb-3">Aloqa Ma'lumotlari</h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-teal-400" />
              <span>+998 (71) 200-00-00</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-teal-400" />
              <span>support@gippo.uz</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-teal-400" />
              <span>Toshkent sh., Yunusobod t., Amir Temur 108</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          {isSent ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">Xabar Yuborildi!</h3>
              <p className="text-xs text-slate-500">Tez orada mutaxassislarimiz javob berishadi.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ismingiz</label>
                <input
                  type="text"
                  required
                  placeholder="Jasur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="jasur@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Xabar Matni</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Savolingizni yozing..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Yuborish
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
