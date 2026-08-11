'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, ShieldAlert, PhoneCall, HeartPulse, CheckCircle2, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Emergency Disclaimer */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center text-white shadow-md">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                Gippo<span className="text-teal-400">.uz</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O'zbekistondagi yetakchi health-tech marketplace. Professional shifokorlar bilan online konsultatsiyalar va bepul AI medical assistant.
            </p>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200/90 leading-tight">
                <strong className="block text-amber-300 font-semibold mb-0.5">Tezkor Yordam (103):</strong>
                Shoshilinch tibbiy holatlarda kechiktirmasdan 103 Tez Yordam xizmatiga qo'ng'iroq qiling. AI assistent tashxis qo'ymaydi.
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Platforma</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/doctors" className="hover:text-teal-400 transition-colors">
                  Shifokorlar Katalogi
                </Link>
              </li>
              <li>
                <Link href="/specialties" className="hover:text-teal-400 transition-colors">
                  Tibbiy Mutaxassisliklar
                </Link>
              </li>
              <li>
                <Link href="/ai" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                  AI Medical Assistant
                  <span className="bg-teal-900 text-teal-300 text-[9px] px-1.5 py-0.2 rounded font-bold">BEPUL</span>
                </Link>
              </li>
              <li>
                <Link href="/doctor/register" className="hover:text-teal-400 transition-colors">
                  Shifokorlar Ro'yxatdan O'tishi
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Info & Security */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Xavfsizlik va Moliya</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                <span>SSL & SHA-256 shifrlangan auth</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>95% / 5% Shaffof ledger hisob-kitobi</span>
              </li>
              <li className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-teal-400" />
                <span>Faqat litsenziyalangan shifokorlar</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bog'lanish</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-4 h-4 text-teal-400" />
                +998 (71) 200-00-00
              </p>
              <p className="text-slate-400">Toshkent sh., Yunusobod t., Amir Temur shoh ko'chasi 108</p>
              <p className="text-slate-400">Email: support@gippo.uz</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Gippo.uz Platformasi. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-400 transition-colors">
              Maxfiylik Siyosati
            </Link>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">
              Foydalanish Qoidalari
            </Link>
            <Link href="/admin/login" className="hover:text-slate-400 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
