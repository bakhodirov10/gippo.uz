'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { doctorsService } from '@/services/doctors';
import { specialtiesService } from '@/services/specialties';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { BookingModal } from '@/components/doctors/BookingModal';
import { DoctorProfile } from '@/types';
import {
  Stethoscope,
  Search,
  Bot,
  ShieldCheck,
  Video,
  Sparkles,
  Users,
  ArrowRight,
  HeartPulse,
  CalendarCheck,
  Star,
  Clock,
  CheckCircle2,
  ChevronDown,
  Zap,
  Lock,
  BarChart3,
  MessageSquare,
  Award,
  Globe,
  Phone,
  Wallet,
  Activity,
  Send,
  BadgeCheck,
  TrendingUp,
  Shield,
} from 'lucide-react';

// ─── Hero floating cards ──────────────────────────────────────────────────────
function HeroVisual() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none" aria-hidden="true">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 via-cyan-300/10 to-blue-400/20 rounded-[48px] blur-3xl" />

      {/* Doctor profile card */}
      <div className="relative z-10 animate-fade-up">
        <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-slate-900 text-sm">Dr. Aziz Karimov</h3>
                <BadgeCheck className="w-4 h-4 text-teal-500 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 mb-2">Kardiolog · 12 yil tajriba</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[10px] text-slate-500 ml-1">4.9 (128 sharh)</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Online</span>
              <p className="text-xs font-black text-slate-900 mt-1">150 000 so'm</p>
              <p className="text-[9px] text-slate-400">konsultatsiya</p>
            </div>
          </div>

          {/* Appointment preview */}
          <div className="mt-4 p-3 bg-teal-50 rounded-2xl border border-teal-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-teal-900">Bugun, 14:00 — Bo'sh</p>
              <p className="text-[10px] text-teal-600">Online video konsultatsiya</p>
            </div>
            <button className="px-3 py-1.5 rounded-xl gradient-teal text-white text-[10px] font-bold shadow-sm shadow-teal-500/30">
              Bron
            </button>
          </div>
        </div>
      </div>

      {/* Floating AI card */}
      <div className="absolute -bottom-6 -left-6 z-20 animate-float-delayed">
        <div className="bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100 w-56">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl gradient-teal flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-900">Gippo AI</p>
              <p className="text-[9px] text-slate-400">Tibbiy assistent · BEPUL</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-[10px] text-slate-600 leading-relaxed">
            "Bosh og'riq odatda stress yoki uyqu etishmasligi bilan bog'liq bo'lishi mumkin..."
          </div>
          <div className="flex gap-1 mt-2">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </div>

      {/* Floating stats chip */}
      <div className="absolute -top-4 -right-4 z-20 animate-float">
        <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-900">Tasdiqlangan</p>
            <p className="text-[9px] text-slate-400">Litsenziyalangan vrach</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── How It Works step ────────────────────────────────────────────────────────
function HowStep({ num, icon: Icon, title, desc, delay }: {
  num: string; icon: React.ElementType; title: string; desc: string; delay: string;
}) {
  return (
    <div className={`relative group animate-fade-up`} style={{ animationDelay: delay }}>
      <div className="bg-slate-800/60 hover:bg-slate-800/90 transition-all duration-300 border border-slate-700/80 hover:border-teal-500/40 rounded-3xl p-7 h-full space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-5xl font-black text-slate-700 leading-none">{num}</span>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
            <Icon className="w-6 h-6 text-teal-400" />
          </div>
        </div>
        <h3 className="font-bold text-xl text-white">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
        {/* Connector */}
        <div className="absolute top-1/2 -right-4 hidden lg:block w-8 h-px bg-gradient-to-r from-teal-500/60 to-transparent last:hidden" />
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay }: {
  icon: React.ElementType; title: string; desc: string; color: string; delay: string;
}) {
  return (
    <div
      className="group relative bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl p-6 border border-slate-200/80 cursor-default animate-fade-up overflow-hidden"
      style={{ animationDelay: delay }}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${color}`} />
      <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${color} opacity-90`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── AI Chat preview ──────────────────────────────────────────────────────────
function AIChatPreview() {
  const messages = [
    { from: 'user', text: "Bosh og'rig'im 3 kundan beri davom etmoqda, nima qilishim kerak?" },
    { from: 'ai', text: "Bosh og'rig'ingizning davomiyligi haqidagi ma'lumot uchun rahmat. Bu bir necha sabablardan kelib chiqishi mumkin — stress, uyqu etishmasligi, suvsizlanish yoki gipertoniya. Birinchi navbatda yetarli suv iching va dam oling. Agar og'riq zo'raysa yoki ko'rish, nutq muammolari paydo bo'lsa, zudlik bilan shifokorga murojaat qiling.", disclaimer: true },
  ];

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700/80 overflow-hidden shadow-2xl">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-slate-700/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Gippo AI</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-400">Har doim tayyor · Bepul</span>
          </div>
        </div>
        <span className="ml-auto text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">
          BEPUL
        </span>
      </div>

      {/* Messages */}
      <div className="p-5 space-y-4 min-h-[280px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {msg.from === 'ai' && (
              <div className="w-7 h-7 rounded-xl gradient-teal flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
              msg.from === 'user'
                ? 'bg-teal-600 text-white rounded-tr-none'
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              <p>{msg.text}</p>
              {msg.disclaimer && (
                <p className="mt-2 text-[9px] text-slate-400 border-t border-slate-700 pt-2">
                  ⚕️ Gippo AI tibbiy tashxis qo'ymaydi va professional shifokor maslahatining o'rnini bosmaydi.
                </p>
              )}
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl gradient-teal flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-3 flex gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-700/60">
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-400">
            Tibbiy savollaringizni kiriting...
          </div>
          <button className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard preview ────────────────────────────────────────────────────────
function DashboardPreview() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
      {/* Topbar */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl gradient-teal flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-slate-900 text-sm">Gippo.uz</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center">
            <span className="text-[9px] font-bold text-teal-700">A</span>
          </div>
          <span className="text-xs font-semibold text-slate-700">Bemor paneli</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Upcoming appointment */}
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-teal-900">Kelgusi qabul</p>
            <p className="text-[11px] text-teal-600">Dr. Aziz Karimov · Ertaga 10:00</p>
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-white border border-teal-200 px-2 py-0.5 rounded-full">
            Tasdiqlangan
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Jami qabullar', val: '—', icon: CalendarCheck, color: 'text-teal-600 bg-teal-50' },
            { label: 'AI suhbatlar', val: '—', icon: Bot, color: 'text-violet-600 bg-violet-50' },
            { label: 'Shifokorlar', val: '—', icon: Users, color: 'text-sky-600 bg-sky-50' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <div className={`w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-base font-black text-slate-900">{s.val}</p>
              <p className="text-[9px] text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/doctors" className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 transition-colors">
            <Search className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800">Shifokor topish</span>
          </Link>
          <Link href="/ai" className="flex items-center gap-2 p-3 rounded-xl border border-violet-200 bg-violet-50/50 hover:bg-violet-100/50 transition-colors">
            <Bot className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-bold text-slate-800">AI Assistent</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white hover:border-teal-200 transition-colors">
      <button
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-sm text-slate-900">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <div className="h-px bg-slate-100 mb-4" />
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Trust bar item ───────────────────────────────────────────────────────────
function TrustItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-3">
      <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-teal-600" />
      </div>
      <span className="text-xs font-semibold text-slate-700 text-center">{label}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(null);
  const [onlineOnly, setOnlineOnly] = useState(false);

  const { data: doctors = [], isLoading: isDoctorsLoading } = useQuery({
    queryKey: ['public-doctors', selectedSpecialtyId, searchTerm],
    queryFn: () => doctorsService.getPublicDoctors({
      specialtyId: selectedSpecialtyId || undefined,
      search: searchTerm || undefined,
    }),
    staleTime: 60_000,
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesService.getAll(),
    staleTime: 300_000,
  });

  const filteredDoctors = onlineOnly ? doctors.filter(d => d.isOnline) : doctors;

  const faqItems = [
    {
      q: "Gippo AI to'liq bepulmi?",
      a: "Ha, Gippo AI tibbiy assistenti platforma tomonidan to'liq bepul taqdim etiladi. U 24/7 ishlaydi va hech qanday abonent to'lov talab etmaydi.",
    },
    {
      q: 'Shifokorlar qanday tekshiriladi?',
      a: "Barcha shifokorlar platformaga qo'shilishdan oldin admin moderatorlari tomonidan diploma, litsenziya va hujjatlar tekshiriladi. Tasdiqlangan shifokorlar 'Verified' belgisi bilan ko'rsatiladi.",
    },
    {
      q: 'Online konsultatsiyaga qanday yozilaman?',
      a: "Shifokor profilini oching, bo'sh vaqt slotini tanlang, to'lovni amalga oshiring — va belgilangan vaqtda video konsultatsiya xonasiga kiring.",
    },
    {
      q: "To'lov qanday amalga oshiriladi?",
      a: "To'lov xavfsiz onlayn tizim orqali amalga oshiriladi. Konsultatsiya narxi shifokorning profil sahifasida ko'rsatiladi.",
    },
    {
      q: "Shifokor daromadining qancha qismi o'ziga qoladi?",
      a: "Gippo platformasi daromadning faqat 5 foizini oladi. Shifokorga 95 foiz to'lanadi. Bu O'zbekiston health-tech sohasidagi eng past komissiya.",
    },
    {
      q: "Doktor sifatida qanday ro'yxatdan o'taman?",
      a: "Shifokor uchun ro'yxatdan o'tish sahifasini to'ldiring, litsenziya va diplom hujjatlarini yuklang. Admin tekshirgach, akkountingiz faollashtiriladi.",
    },
    {
      q: "AI tibbiy tashxis qo'ya oladimi?",
      a: "Yo'q. Gippo AI faqat umumiy tibbiy ma'lumot beradi va professional shifokor maslahatining o'rnini bosmaydi. Aniq tashxis uchun doim vrach bilan murojaat qiling.",
    },
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] gradient-hero flex items-center pt-8 pb-20 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left */}
            <div className="space-y-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-teal-200 shadow-sm animate-fade-up">
                <Sparkles className="w-4 h-4 text-teal-500 animate-pulse" />
                <span className="text-xs font-bold text-teal-700">O'zbekistondagi zamonaviy Health-Tech platforma</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight animate-fade-up-delay-1">
                Sog'lig'ingiz uchun kerak bo'lgan yordam{' '}
                <span className="text-gradient">bitta platformada.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl animate-fade-up-delay-2">
                Tasdiqlangan shifokorlarni toping, online konsultatsiyaga yoziling yoki{' '}
                <span className="font-semibold text-teal-700">Gippo AI</span> orqali sog'lig'ingiz haqidagi savollarga{' '}
                <span className="font-semibold text-teal-700">bepul</span> ma'lumot oling.
              </p>

              {/* Search bar */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 flex gap-2 animate-fade-up-delay-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Shifokor ismi yoki mutaxassislik..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (window.location.href = `/doctors?search=${encodeURIComponent(searchTerm)}`)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-transparent"
                  />
                </div>
                <Link
                  href={`/doctors${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`}
                  className="px-5 py-2.5 rounded-xl gradient-teal text-white font-bold text-sm shadow-md shadow-teal-500/25 hover:opacity-95 transition-opacity whitespace-nowrap flex items-center gap-1.5"
                >
                  Shifokor topish
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* CTAs row */}
              <div className="flex flex-wrap items-center gap-3 animate-fade-up-delay-3">
                <Link
                  href="/ai"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-lg"
                >
                  <Bot className="w-4 h-4 text-teal-400" />
                  Gippo AI bilan suhbat
                  <span className="text-[10px] font-extrabold bg-teal-500 text-white px-1.5 py-0.5 rounded-full">BEPUL</span>
                </Link>
                <Link
                  href="/doctor/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-300 hover:border-teal-300 bg-white text-slate-700 hover:text-teal-700 font-bold text-sm transition-all"
                >
                  <Stethoscope className="w-4 h-4" />
                  Men shifokorman
                </Link>
              </div>
            </div>

            {/* Right — Hero visual */}
            <div className="hidden lg:flex justify-end animate-scale-in">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. TRUST BAR
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-slate-200/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center lg:justify-between gap-4 divide-x divide-slate-100">
            <TrustItem icon={BadgeCheck} label="Tasdiqlangan shifokorlar" />
            <TrustItem icon={Video} label="Online konsultatsiya" />
            <TrustItem icon={Lock} label="Xavfsiz to'lov" />
            <TrustItem icon={Bot} label="Gippo AI · Bepul" />
            <TrustItem icon={Star} label="Reyting va sharhlar" />
            <TrustItem icon={Clock} label="24/7 mavjudlik" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. HOW GIPPO WORKS
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="gradient-dark py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,148,136,0.12)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-teal-400 uppercase tracking-widest mb-3">Qanday ishlaydi</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">To'rt qadamda sog'lig'ingizni muhofaza qiling</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Gippo.uz orqali konsultatsiya olish oddiy va qulay</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <HowStep num="01" icon={Search} title="Shifokor toping" desc="Mutaxassislik, tajriba va reyting bo'yicha litsenziyalangan shifokorni toping." delay="0ms" />
            <HowStep num="02" icon={CalendarCheck} title="Vaqt tanlang" desc="Shifokorning mavjud bo'sh vaqt slotlaridan o'zingizga qulay vaqtni tanlang." delay="100ms" />
            <HowStep num="03" icon={Wallet} title="Bron va to'lov" desc="Belgilangan narxda onlayn to'lovni amalga oshiring va bronni tasdiqlang." delay="200ms" />
            <HowStep num="04" icon={Video} title="Video konsultatsiya" desc="Belgilangan vaqtda xavfsiz video xonaga kiring va shifokor bilan suhbatlashing." delay="300ms" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. SPECIALTIES
      ════════════════════════════════════════════════════════════════════════ */}
      {specialties.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-2">Mutaxassisliklar</span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Kerakli sohani tanlang</h2>
              </div>
              <Link href="/specialties" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 hidden sm:flex">
                Barchasi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {specialties.slice(0, 16).map(sp => (
                <button
                  key={sp.id}
                  onClick={() => setSelectedSpecialtyId(selectedSpecialtyId === sp.id ? '' : sp.id)}
                  className={`group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
                    selectedSpecialtyId === sp.id
                      ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-500/20'
                      : 'bg-slate-50 border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                    selectedSpecialtyId === sp.id ? 'bg-white/20 text-white' : 'bg-white text-teal-700 border border-slate-200'
                  }`}>
                    {sp.name[0]}
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">{sp.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          5. DOCTOR MARKETPLACE
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 gradient-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-2">Shifokorlar katalogi</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">O'zingizga mos shifokorni toping</h2>
              <p className="text-slate-500 text-sm mt-2">Tasdiqlangan, litsenziyalangan mutaxassislar</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setOnlineOnly(!onlineOnly)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${onlineOnly ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${onlineOnly ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-xs font-bold text-slate-700">Faqat online</span>
              </label>
              <Link href="/doctors" className="text-sm font-bold text-teal-600 flex items-center gap-1 hover:text-teal-700">
                Barchasi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Doctor grid */}
          {isDoctorsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 rounded-3xl skeleton" />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
              <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Shifokorlar topilmadi</h3>
              <p className="text-sm text-slate-400 mt-2 mb-6">
                {onlineOnly ? "Hozirda online shifokorlar mavjud emas" : "Filtrni o'zgartiring yoki backend ishga tushirilganligini tekshiring"}
              </p>
              {onlineOnly && (
                <button
                  onClick={() => setOnlineOnly(false)}
                  className="px-5 py-2.5 rounded-xl gradient-teal text-white text-sm font-bold"
                >
                  Barcha shifokorlarni ko'rish
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.slice(0, 6).map(doc => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onBookClick={doctor => setBookingDoctor(doctor)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. GIPPO AI SECTION
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: AI chat preview */}
            <div className="animate-slide-right">
              <AIChatPreview />
            </div>

            {/* Right: copy */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-200">
                <Bot className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-bold text-violet-700">Gippo AI Assistent</span>
                <span className="text-[10px] font-extrabold bg-violet-600 text-white px-1.5 py-0.5 rounded-full">BEPUL</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                Avval <span className="text-gradient">Gippo AI</span>'dan so'rang
              </h2>

              <p className="text-lg text-slate-600 leading-relaxed">
                Simptomlaringizni yozing va darhol umumiy tibbiy ma'lumot oling. Gippo AI 24/7 ishlaydi va hech qanday to'lov talab etmaydi.
              </p>

              <div className="space-y-3">
                {[
                  { icon: Zap, text: "24/7 darhol javob \u2014 kutish yo'q" },
                  { icon: Globe, text: "O'zbek va rus tillarida ishlaydi" },
                  { icon: Shield, text: "Shaxsiy ma'lumotlar xavfsiz saqlanadi" },
                  { icon: HeartPulse, text: "Favqulodda holatlarda 103 Tez Yordam ga yo'naltiradi" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Safety notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-bold">⚕️ Muhim:</span> Gippo AI tibbiy tashxis qo'ymaydi va professional shifokor maslahatining o'rnini bosmaydi. Aniq tashxis uchun doim malakali vrach bilan murojaat qiling.
                </p>
              </div>

              <Link
                href="/ai"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors shadow-lg"
              >
                <Bot className="w-5 h-5 text-teal-400" />
                Gippo AI bilan suhbat
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. PLATFORM PREVIEW (Dashboard)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 gradient-section-alt overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200">
                <Activity className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-teal-700">Bemor paneli</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                Barcha tibbiy faoliyatingizni <span className="text-gradient">bitta joyda</span> boshqaring
              </h2>

              <p className="text-lg text-slate-600 leading-relaxed">
                Kelgusi qabullaringiz, AI suhbatlar tarixi, konsultatsiyalar va to'lovlar — hammasi shaxsiy panelingizda.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: CalendarCheck, title: 'Qabullar', desc: 'Barcha bron va jadvallar' },
                  { icon: Bot, title: 'AI Suhbatlar', desc: 'Tibbiy savol-javoblar' },
                  { icon: Video, title: 'Konsultatsiyalar', desc: 'Online video qabullar' },
                  { icon: BarChart3, title: "Tarix", desc: "To'liq tibbiy tarix" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-200 hover:shadow-md transition-all">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl gradient-teal text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 transition-opacity">
                Bepul akkount yaratish
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: dashboard preview */}
            <div className="animate-slide-right">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. WHY GIPPO — 6 feature cards
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-3">Nima uchun Gippo?</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">Bir platformada barcha imkoniyatlar</h2>
            <p className="text-slate-500 max-w-xl mx-auto">O'zbekistonning zamonaviy health-tech ekotizimi</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={BadgeCheck}
              title="Tasdiqlangan shifokorlar"
              desc="Barcha shifokorlar admin moderatorlari tomonidan diploma va litsenziya orqali tekshiriladi. Faqat tasdiqlangan mutaxassislar ro'yxatda ko'rsatiladi."
              color="bg-teal-500"
              delay="0ms"
            />
            <FeatureCard
              icon={Video}
              title="Online konsultatsiya"
              desc="Shifokor bilan uydan chiqmasdan xavfsiz video qabul o'ting. Istalgan vaqtda, istalgan joydan."
              color="bg-sky-500"
              delay="60ms"
            />
            <FeatureCard
              icon={Wallet}
              title="Shaffof to'lov modeli"
              desc="Shifokor daromadning 95 foizini oladi. Platforma faqat 5 foiz komissiya oladi. Hamma narx ochiq ko'rsatiladi."
              color="bg-emerald-500"
              delay="120ms"
            />
            <FeatureCard
              icon={Star}
              title="Reyting va sharhlar"
              desc="Faqat real konsultatsiya olgan bemorlar shifokorni baholay oladi. Haqiqiy tajribaga asoslangan reyting tizimi."
              color="bg-amber-500"
              delay="180ms"
            />
            <FeatureCard
              icon={Bot}
              title="Bepul AI assistent"
              desc="24/7 mavjud Gippo AI tibbiy assistenti umumiy sog'liq savollari va simptomlar haqida ma'lumot beradi. To'liq bepul."
              color="bg-violet-500"
              delay="240ms"
            />
            <FeatureCard
              icon={Shield}
              title="Xavfsiz platforma"
              desc="JWT autentifikatsiya, xavfsiz to'lov oqimi, shifrlangan ma'lumotlar va admin audit nazorati bilan ishlaydi."
              color="bg-rose-500"
              delay="300ms"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          9. FOR DOCTORS
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(13,148,136,0.15)_0%,transparent_80%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-teal-300">Shifokorlar uchun</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Shifokormisiz?{' '}
                <span className="text-gradient">Gippo'ga qo'shiling.</span>
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed">
                Professional profilingizni yarating, mavjudligingizni boshqaring va onlayn konsultatsiyalar orqali bemorlar bilan bog'laning. Har bir konsultatsiyadan{' '}
                <span className="font-bold text-teal-400">95%</span> daromad oling.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Users, text: 'Professional profil yaratish' },
                  { icon: CalendarCheck, text: 'Mavjudlik jadvalini boshqarish' },
                  { icon: Video, text: "Online video qabullar o'tkazish" },
                  { icon: TrendingUp, text: 'Daromadni kuzatib borish' },
                  { icon: MessageSquare, text: 'Bemorlar bilan muloqot' },
                  { icon: Wallet, text: '95% daromad — eng past komissiya' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-teal-400" />
                    </div>
                    <span className="text-sm text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <span className="font-bold text-white">Admin tasdiqlash:</span> Shifokorlar platformaga qo'shilishdan oldin admin tomonidan tasdiqlanadi. Bu bemorlar xavfsizligini kafolatlaydi.
                  </p>
                </div>
              </div>

              <Link
                href="/doctor/register"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl gradient-teal text-white font-bold text-sm shadow-xl shadow-teal-500/25 hover:opacity-95 transition-opacity"
              >
                Shifokor sifatida qo'shilish
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Doctor revenue card */}
            <div className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-7 space-y-6">
                <h3 className="font-bold text-white text-lg">Daromad modeli</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Shifokor ulushi</span>
                      <span className="font-black text-teal-400 text-xl">95%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Platforma komissiyasi</span>
                      <span className="font-black text-slate-400 text-xl">5%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white/20 rounded-full" style={{ width: '5%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed border-t border-white/10 pt-4">
                  To'lov bo'linishi backend tomonidan hisoblanadi va tasdiqlash uchun manba bo'lib xizmat qiladi. Frontend faqat ma'lumot uchun ko'rsatadi.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/15 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">O'z jadvalingiz — o'z shartlaringiz</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Qachon va qancha ishlashingizni o'zingiz belgilaysiz. Mavjudlik slotlarini platformada boshqaring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          10. SECURITY & TRUST
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-3">Xavfsizlik va ishonch</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Platforma xavfsizligi</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Lock, title: 'JWT autentifikatsiya', desc: 'Access token va refresh token rotatsiyasi' },
              { icon: BadgeCheck, title: 'Shifokor moderatsiya', desc: 'Har bir shifokor admin tomonidan tasdiqlangan' },
              { icon: Shield, title: "Xavfsiz to'lov oqimi", desc: "To'lov bo'linishi backend orqali hisoblanadi" },
              { icon: CalendarCheck, title: 'Qabul boshqaruvi', desc: "To'liq appointment lifecycle nazorati" },
              { icon: Activity, title: 'Admin audit', desc: 'Barcha harakatlar audit logda saqlanadi' },
            ].map((item, i) => (
              <div key={i} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-teal-200 hover:shadow-md transition-all text-center">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-bold text-xs text-slate-900 mb-1">{item.title}</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          11. FAQ
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 gradient-section-alt">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-3">Savollar</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Ko'p so'raladigan savollar</h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          12. FINAL CTA
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(13,148,136,0.2)_0%,transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
            <HeartPulse className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="text-xs font-bold text-teal-300">Bugundan boshlang</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Sog'lig'ingizga g'amxo'rlik qilishni{' '}
            <span className="text-gradient">bugundan boshlang.</span>
          </h2>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Tasdiqlangan shifokorlar bilan onlayn konsultatsiya yoki Gippo AI orqali bepul tibbiy ma'lumot oling.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              href="/doctors"
              className="px-8 py-4 rounded-2xl gradient-teal text-white font-bold text-base shadow-xl shadow-teal-500/25 hover:opacity-95 transition-opacity flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Shifokor topish
            </Link>
            <Link
              href="/ai"
              className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold text-base transition-colors flex items-center gap-2"
            >
              <Bot className="w-5 h-5 text-teal-400" />
              Gippo AI bilan suhbat
              <span className="text-[10px] font-extrabold bg-teal-500 text-white px-1.5 py-0.5 rounded-full">BEPUL</span>
            </Link>
          </div>

          {/* Medical disclaimer */}
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            ⚕️ Gippo.uz tibbiy maslahat platformasi bo'lib, professional shifokor xulosasining o'rnini bosmaydi. Favqulodda tibbiy holatlarda 103 — Tez Yordam xizmatiga murojaat qiling.
          </p>
        </div>
      </section>

      {/* Booking modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          isOpen={!!bookingDoctor}
          onClose={() => setBookingDoctor(null)}
        />
      )}
    </div>
  );
}
