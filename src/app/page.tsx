'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { doctorsService } from '@/services/doctors';
import { specialtiesService } from '@/services/specialties';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { BookingModal } from '@/components/doctors/BookingModal';
import { DoctorProfile } from '@/types';
import { TiltCard } from '@/components/ui/TiltCard';
import { HeroCanvas, AICanvas, Icon3DCanvas } from '@/components/3d';
import { useLanguageStore } from '@/stores/useLanguageStore';
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
  ChevronDown,
  Zap,
  Lock,
  BarChart3,
  MessageSquare,
  Award,
  Globe,
  Wallet,
  Activity,
  Send,
  BadgeCheck,
  TrendingUp,
  Shield,
} from 'lucide-react';

// ─── Hero Floating Visual with 3D Canvas Background ────────────────────────────
function HeroVisual() {
  const { t } = useLanguageStore();

  return (
    <div className="relative w-full max-w-lg mx-auto select-none" aria-hidden="true">
      {/* 3D Background Sphere */}
      <div className="absolute inset-0 -top-8 flex items-center justify-center pointer-events-none z-0">
        <HeroCanvas />
      </div>

      {/* Doctor profile card */}
      <div className="relative z-10 animate-fade-up">
        <TiltCard maxTilt={8}>
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center text-white font-black text-xl shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.landing.heroCard.docName}</h3>
                  <BadgeCheck className="w-4 h-4 text-teal-500 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.landing.heroCard.docTitle}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">{t.landing.heroCard.reviewsCount}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">{t.landing.heroCard.statusOnline}</span>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{t.landing.heroCard.price}</p>
                <p className="text-[9px] text-slate-400">{t.landing.heroCard.consultation}</p>
              </div>
            </div>

            {/* Appointment preview */}
            <div className="mt-4 p-3 bg-teal-50/80 dark:bg-teal-950/40 rounded-2xl border border-teal-100 dark:border-teal-900/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-teal-900 dark:text-teal-200">{t.landing.heroCard.todaySlot}</p>
                <p className="text-[10px] text-teal-600 dark:text-teal-400">{t.landing.heroCard.videoType}</p>
              </div>
              <button className="px-3 py-1.5 rounded-xl gradient-teal text-white text-[10px] font-bold shadow-sm shadow-teal-500/30">
                {t.landing.heroCard.bookBtn}
              </button>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Floating AI card */}
      <div className="absolute -bottom-6 -left-6 z-20 animate-float-delayed">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-100 dark:border-slate-800 w-56 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl gradient-teal flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-900 dark:text-white">{t.landing.heroCard.aiBubbleTitle}</p>
              <p className="text-[9px] text-slate-400">{t.landing.heroCard.aiBubbleSubtitle}</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2 text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
            "{t.landing.heroCard.aiBubbleText}"
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
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 transition-colors">
          <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950/60 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-900 dark:text-white">{t.landing.heroCard.verifiedChipTitle}</p>
            <p className="text-[9px] text-slate-400">{t.landing.heroCard.verifiedChipSubtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── How It Works Step Component with 3D Canvas Icon ─────────────────────────
function HowStep({
  num,
  step,
  title,
  desc,
  delay,
}: {
  num: string;
  step: '01' | '02' | '03' | '04';
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className="relative group h-full"
    >
      <TiltCard maxTilt={5} className="h-full">
        <div className="bg-slate-800/70 dark:bg-slate-900/90 hover:bg-slate-800/95 transition-all duration-300 border border-slate-700/80 hover:border-teal-500/40 rounded-3xl p-7 h-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-5xl font-black text-slate-700 dark:text-slate-600 leading-none">{num}</span>
            <Icon3DCanvas step={step} />
          </div>
          <h3 className="font-bold text-xl text-white">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
        </div>
      </TiltCard>
    </motion.div>
  );
}

// ─── Feature Card Component with Tilt ─────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <TiltCard maxTilt={6} className="h-full">
        <div className="group relative bg-white dark:bg-slate-900 hover:shadow-2xl transition-all duration-300 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 cursor-default overflow-hidden h-full">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${color}`} />
          <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${color} opacity-90 shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
        </div>
      </TiltCard>
    </motion.div>
  );
}

// ─── AI Chat Preview Component with 3D Neural Canvas Overlay ──────────────────
function AIChatPreview() {
  const { t } = useLanguageStore();

  const messages = [
    { from: 'user', text: t.ai.suggested1 },
    {
      from: 'ai',
      text: t.ai.welcomeMessage,
      disclaimer: true,
    },
  ];

  return (
    <div className="relative bg-slate-900 dark:bg-slate-950 rounded-3xl border border-slate-700/80 dark:border-slate-800 overflow-hidden shadow-2xl">
      {/* 3D Neural Mesh Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
        <AICanvas />
      </div>

      <div className="relative z-10">
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-slate-700/60 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md">
          <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Gippo AI</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-400">{t.ai.subtitle}</span>
            </div>
          </div>
          <span className="ml-auto text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">
            {t.hero.freeBadge}
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
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700 backdrop-blur-sm'
                }`}
              >
                <p>{msg.text}</p>
                {msg.disclaimer && (
                  <p className="mt-2 text-[9px] text-slate-400 border-t border-slate-700 pt-2">
                    ⚕️ {t.ai.disclaimer}
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
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl rounded-tl-none p-3 flex gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-700/60 bg-slate-900/80 backdrop-blur-md">
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-400 truncate">
              {t.ai.placeholder}
            </div>
            <button className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Preview Component with Depth Shadow ──────────────────────────────
function DashboardPreview() {
  const { t } = useLanguageStore();

  return (
    <TiltCard maxTilt={5}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
        {/* Topbar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-teal flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-sm">Gippo.uz</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 border-2 border-teal-200 dark:border-teal-800 flex items-center justify-center">
              <span className="text-[9px] font-bold text-teal-700 dark:text-teal-300">A</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.nav.dashboard}</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Upcoming appointment */}
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-teal-900 dark:text-teal-200">{t.dashboard.upcomingTitle}</p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400">Dr. Aziz Karimov · {t.landing.heroCard.todaySlot}</p>
            </div>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
              {t.status.CONFIRMED}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t.dashboard.pendingAppointments, val: '—', icon: CalendarCheck, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60' },
              { label: t.dashboard.aiChatTitle, val: '—', icon: Bot, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/60' },
              { label: t.nav.doctors, val: '—', icon: Users, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/80 text-center">
                <div className={`w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white">{s.val}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/doctors"
              className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-950/40 transition-colors"
            >
              <Search className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.hero.findDoctor}</span>
            </Link>
            <Link
              href="/ai"
              className="flex items-center gap-2 p-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/40 hover:bg-violet-100/50 transition-colors"
            >
              <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.nav.ai}</span>
            </Link>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

// ─── FAQ Item Component ───────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 hover:border-teal-200 dark:hover:border-teal-700 transition-colors">
      <button
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-sm text-slate-900 dark:text-white">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <div className="h-px bg-slate-100 dark:bg-slate-800 mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Trust Bar Item Component ─────────────────────────────────────────────────
function TrustItem({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-3">
      <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900 flex items-center justify-center">
        <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">{label}</span>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function HomePage() {
  const { t } = useLanguageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(null);
  const [onlineOnly, setOnlineOnly] = useState(false);

  const { data: doctors = [], isLoading: isDoctorsLoading } = useQuery({
    queryKey: ['public-doctors', selectedSpecialtyId, searchTerm],
    queryFn: () =>
      doctorsService.getPublicDoctors({
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

  const filteredDoctors = onlineOnly ? doctors.filter((d) => d.isOnline) : doctors;

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
          1. HERO SECTION WITH 3D CANVAS
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] gradient-hero flex items-center pt-8 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left Column Text & Search */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-7"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 shadow-sm">
                <Sparkles className="w-4 h-4 text-teal-500 animate-pulse" />
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300">{t.hero.badge}</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight">
                {t.hero.title}{' '}
                <span className="text-gradient">{t.hero.titleGradient}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {t.hero.subtitle}
              </p>

              {/* Search bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 flex gap-2 max-w-lg transition-colors">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder={t.hero.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (window.location.href = `/doctors?search=${encodeURIComponent(searchTerm)}`)
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-transparent"
                  />
                </div>
                <Link
                  href={`/doctors${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`}
                  className="px-5 py-2.5 rounded-xl gradient-teal text-white font-bold text-sm shadow-md shadow-teal-500/25 hover:opacity-95 transition-opacity whitespace-nowrap flex items-center gap-1.5"
                >
                  {t.hero.findDoctor}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* CTAs row */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/ai"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm transition-colors shadow-lg"
                >
                  <Bot className="w-4 h-4 text-teal-400" />
                  {t.hero.chatAI}
                  <span className="text-[10px] font-extrabold bg-teal-500 text-white px-1.5 py-0.5 rounded-full">
                    {t.hero.freeBadge}
                  </span>
                </Link>
                <Link
                  href="/doctor/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 font-bold text-sm transition-all"
                >
                  <Stethoscope className="w-4 h-4" />
                  {t.hero.iAmDoctor}
                </Link>
              </div>
            </motion.div>

            {/* Right Column 3D Visual Composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex justify-end"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. TRUST BAR
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center lg:justify-between gap-4 divide-x divide-slate-100 dark:divide-slate-800">
            <TrustItem icon={BadgeCheck} label={t.trust.verifiedDoctors} />
            <TrustItem icon={Video} label={t.trust.onlineConsultations} />
            <TrustItem icon={Lock} label={t.trust.securePayments} />
            <TrustItem icon={Bot} label={t.trust.freeAI} />
            <TrustItem icon={Star} label={t.trust.ratingsReviews} />
            <TrustItem icon={Clock} label={t.trust.availability} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. HOW GIPPO WORKS WITH 3D STEP ICONS
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="gradient-dark py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-teal-400 uppercase tracking-widest mb-3">
              {t.howItWorks.badge}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">{t.howItWorks.title}</h2>
            <p className="text-slate-400 max-w-xl mx-auto">{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <HowStep
              num="01"
              step="01"
              title={t.howItWorks.step1Title}
              desc={t.howItWorks.step1Desc}
              delay={0}
            />
            <HowStep
              num="02"
              step="02"
              title={t.howItWorks.step2Title}
              desc={t.howItWorks.step2Desc}
              delay={0.1}
            />
            <HowStep
              num="03"
              step="03"
              title={t.howItWorks.step3Title}
              desc={t.howItWorks.step3Desc}
              delay={0.2}
            />
            <HowStep
              num="04"
              step="04"
              title={t.howItWorks.step4Title}
              desc={t.howItWorks.step4Desc}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. SPECIALTIES GRID
      ════════════════════════════════════════════════════════════════════════ */}
      {specialties.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block mb-2">
                  {t.nav.specialties}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{t.landing.topSpecialtiesTitle}</h2>
              </div>
              <Link
                href="/specialties"
                className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 hidden sm:flex"
              >
                {t.landing.viewAllSpecialties}
              </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {specialties.slice(0, 16).map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => setSelectedSpecialtyId(selectedSpecialtyId === sp.id ? '' : sp.id)}
                  className={`group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
                    selectedSpecialtyId === sp.id
                      ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-500/20'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      selectedSpecialtyId === sp.id
                        ? 'bg-white/20 text-white'
                        : 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
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
          5. DOCTOR MARKETPLACE (3D TILT CARDS)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 gradient-section-alt dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block mb-2">
                {t.doctors.title}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{t.landing.featuredDoctorsTitle}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{t.landing.featuredDoctorsSubtitle}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setOnlineOnly(!onlineOnly)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    onlineOnly ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      onlineOnly ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.doctors.onlineOnly}</span>
              </label>
              <Link href="/doctors" className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:text-teal-700">
                {t.landing.viewAllDoctors}
              </Link>
            </div>
          </div>

          {isDoctorsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-3xl skeleton" />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Users className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t.doctors.noDoctorsFound}</h3>
              <p className="text-sm text-slate-400 mt-2 mb-6">
                {t.doctors.noDoctorsFoundDesc}
              </p>
              {onlineOnly && (
                <button
                  onClick={() => setOnlineOnly(false)}
                  className="px-5 py-2.5 rounded-xl gradient-teal text-white text-sm font-bold"
                >
                  {t.doctors.clearFilters}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.slice(0, 6).map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} onBookClick={(doctor) => setBookingDoctor(doctor)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. GIPPO AI SECTION WITH 3D NEURAL CANVAS
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-slate-950 transition-colors overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: AI chat preview with 3D Canvas */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <AIChatPreview />
            </motion.div>

            {/* Right: copy */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-7"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800">
                <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300">{t.ai.title}</span>
                <span className="text-[10px] font-extrabold bg-violet-600 text-white px-1.5 py-0.5 rounded-full">
                  {t.hero.freeBadge}
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {t.landing.aiBannerTitle}
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.landing.aiBannerSubtitle}
              </p>

              <div className="space-y-3">
                {[
                  { icon: Zap, text: "24/7 darhol javob — kutish yo'q" },
                  { icon: Globe, text: "Uzbek, Russian & English language support" },
                  { icon: Shield, text: "Shaxsiy ma'lumotlar xavfsiz saqlanadi" },
                  { icon: HeartPulse, text: "Favqulodda holatlarda 103 Tez Yordam ga yo'naltiradi" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  <span className="font-bold">⚕️ {t.ai.disclaimer}</span>
                </p>
              </div>

              <Link
                href="/ai"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold transition-colors shadow-lg"
              >
                <Bot className="w-5 h-5 text-teal-400" />
                {t.landing.tryAIBtn}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. PLATFORM PREVIEW (DASHBOARD PREVIEW WITH TILT)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 gradient-section-alt dark:bg-slate-900 transition-colors overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300">{t.nav.dashboard}</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {t.dashboard.subtitle}
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.dashboard.upcomingTitle}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: CalendarCheck, title: t.nav.myAppointments, desc: 'Barcha bron va jadvallar' },
                  { icon: Bot, title: t.nav.ai, desc: 'Tibbiy savol-javoblar' },
                  { icon: Video, title: t.trust.onlineConsultations, desc: 'Online video qabullar' },
                  { icon: BarChart3, title: t.nav.paymentHistory, desc: "To'liq tibbiy tarix" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-200 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl gradient-teal text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 transition-opacity"
              >
                {t.nav.register}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: dashboard preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. WHY GIPPO — 6 FEATURE CARDS WITH 3D TILT
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block mb-3">
              {t.features.title}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">{t.features.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={BadgeCheck}
              title={t.features.f1Title}
              desc={t.features.f1Desc}
              color="bg-teal-500"
              delay={0}
            />
            <FeatureCard
              icon={Video}
              title={t.features.f2Title}
              desc={t.features.f2Desc}
              color="bg-sky-500"
              delay={0.1}
            />
            <FeatureCard
              icon={Wallet}
              title={t.features.f4Title}
              desc={t.features.f4Desc}
              color="bg-emerald-500"
              delay={0.2}
            />
            <FeatureCard
              icon={Star}
              title={t.trust.ratingsReviews}
              desc="Faqat real konsultatsiya olgan bemorlar shifokorni baholay oladi. Haqiqiy tajribaga asoslangan reyting tizimi."
              color="bg-amber-500"
              delay={0.3}
            />
            <FeatureCard
              icon={Bot}
              title={t.features.f3Title}
              desc={t.features.f3Desc}
              color="bg-violet-500"
              delay={0.4}
            />
            <FeatureCard
              icon={Shield}
              title={t.footer.securityTitle}
              desc="JWT autentifikatsiya, xavfsiz to'lov oqimi, shifrlangan ma'lumotlar va admin audit nazorati bilan ishlaydi."
              color="bg-rose-500"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          9. FOR DOCTORS
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(13,148,136,0.15)_0%,transparent_80%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-teal-300">{t.nav.forDoctors}</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Shifokormisiz? <span className="text-gradient">Gippo'ga qo'shiling.</span>
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed">
                Professional profilingizni yarating, mavjudligingizni boshqaring va onlayn konsultatsiyalar orqali
                bemorlar bilan bog'laning. Har bir konsultatsiyadan{' '}
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
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-colors"
                  >
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
                    <span className="font-bold text-white">Admin tasdiqlash:</span> Shifokorlar platformaga qo'shilishdan
                    oldin admin tomonidan tasdiqlanadi. Bu bemorlar xavfsizligini kafolatlaydi.
                  </p>
                </div>
              </div>

              <Link
                href="/doctor/register"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl gradient-teal text-white font-bold text-sm shadow-xl shadow-teal-500/25 hover:opacity-95 transition-opacity"
              >
                {t.nav.forDoctors}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Doctor revenue card */}
            <TiltCard maxTilt={5}>
              <div className="space-y-5">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-7 space-y-6">
                  <h3 className="font-bold text-white text-lg">Daromad modeli</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300">Shifokor ulushi</span>
                        <span className="font-black text-teal-400 text-xl">95%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                          style={{ width: '95%' }}
                        />
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
                    To'lov bo'linishi backend tomonidan hisoblanadi va tasdiqlash uchun manba bo'lib xizmat qiladi.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex items-start gap-4">
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
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          10. FAQ ACCORDION
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 gradient-section-alt dark:bg-slate-900 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block mb-3">Savollar</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Ko'p so'raladigan savollar</h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          11. FINAL CTA
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(13,148,136,0.2)_0%,transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
            <HeartPulse className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="text-xs font-bold text-teal-300">{t.hero.badge}</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            {t.hero.title} <span className="text-gradient">{t.hero.titleGradient}</span>
          </h2>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              href="/doctors"
              className="px-8 py-4 rounded-2xl gradient-teal text-white font-bold text-base shadow-xl shadow-teal-500/25 hover:opacity-95 transition-opacity flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              {t.hero.findDoctor}
            </Link>
            <Link
              href="/ai"
              className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold text-base transition-colors flex items-center gap-2"
            >
              <Bot className="w-5 h-5 text-teal-400" />
              {t.hero.chatAI}
              <span className="text-[10px] font-extrabold bg-teal-500 text-white px-1.5 py-0.5 rounded-full">
                {t.hero.freeBadge}
              </span>
            </Link>
          </div>

          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            ⚕️ {t.ai.disclaimer}
          </p>
        </div>
      </section>

      {/* Booking modal */}
      {bookingDoctor && (
        <BookingModal doctor={bookingDoctor} isOpen={!!bookingDoctor} onClose={() => setBookingDoctor(null)} />
      )}
    </div>
  );
}
