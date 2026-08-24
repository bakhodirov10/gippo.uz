'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { KeyRound, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t } = useLanguageStore();
  const router = useRouter();

  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await authService.sendOtp(email, 'PASSWORD_RESET');
      setSuccessMsg(res.message || '6 xonali tasdiqlash kodi email manzilingizga yuborildi');
      setStep('OTP');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Kodni yuborishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.sendOtp(email, 'PASSWORD_RESET');
      setSuccessMsg(res.message || 'Yangi tasdiqlash kodi yuborildi');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Qayta kod yuborishda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Parollar bir-biriga mos kelmadi');
      return;
    }
    if (newPassword.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo\'lishi shart');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await authService.resetPassword({
        email,
        code: otpCode,
        newPassword,
      });
      setSuccessMsg(res.message || 'Parol muvaffaqiyatli yangilandi!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Parolni tiklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl max-w-md w-full space-y-6 transition-colors">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900 flex items-center justify-center mx-auto shadow-sm">
            {step === 'EMAIL' ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {step === 'EMAIL' ? t.auth.forgotPasswordTitle : 'Kodni tasdiqlash'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'EMAIL'
              ? 'Email manzilingizni kiriting. Biz 6 xonali tasdiqlash kodini yuboramiz.'
              : `${email} manziliga yuborilgan 6 xonali kodni va yangi parolni kiriting.`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'EMAIL' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.auth.email}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 text-xs flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <span>Kodni yuborish (OTP)</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                6 xonali tasdiqlash kodi
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-mono text-lg font-bold py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Yangi parol
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Kamida 8 ta belgi"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Yangi parolni takrorlang
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Parolni qayta kiriting"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 text-xs flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yangilanmoqda...</span>
                </>
              ) : (
                <span>Parolni yangilash</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="text-slate-500 hover:text-teal-600"
              >
                Emailni o'zgartirish
              </button>
              <button
                type="button"
                disabled={countdown > 0 || isLoading}
                onClick={handleResendOtp}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{countdown > 0 ? `${countdown}s kuting` : 'Kodni qayta yuborish'}</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <Link href="/login" className="font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            {t.doctors.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
