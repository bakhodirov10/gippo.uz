'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { specialtiesService } from '@/services/specialties';
import { useLanguageStore } from '@/stores/useLanguageStore';
import {
  Stethoscope,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Loader2,
  Award,
  FileText,
  GraduationCap,
} from 'lucide-react';

export default function DoctorRegisterPage() {
  const router = useRouter();
  const { t } = useLanguageStore();

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesService.getAll(),
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    licenseNumber: '',
    experienceYears: 5,
    education: '',
    consultationFee: 150000,
    specialtyIds: [] as string[],
    bio: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const licenseNumber = formData.licenseNumber.trim();
    const education = formData.education.trim();
    const bio = formData.bio.trim();
    const password = formData.password;

    if (!firstName || !lastName) {
      setError("Ism va familiya kiritilishi shart.");
      return;
    }
    if (!email) {
      setError("Email manzili kiritilishi shart.");
      return;
    }
    if (!licenseNumber) {
      setError("Tibbiy litsenziya raqami kiritilishi shart.");
      return;
    }
    if (!education) {
      setError("Tibbiyot o'quv yurt/OTM (education) kiritilishi shart.");
      return;
    }
    if (!bio) {
      setError("Kasbiy tajriba va ma'lumot (bio) kiritilishi shart.");
      return;
    }
    if (formData.specialtyIds.length === 0 || !formData.specialtyIds[0]) {
      setError("Kamida bitta mutaxassislik yo'nalishini tanlang.");
      return;
    }
    if (password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.registerDoctor({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        licenseNumber,
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
        specialtyIds: formData.specialtyIds,
        education,
        bio,
        password,
      });
      setSuccessMsg(
        res.message ||
          "Shifokor arizasi muvaffaqiyatli topshirildi. Admin tasdiqlashini kuting.",
      );
    } catch (err: any) {
      const msg = err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi';
      if (
        (msg.includes('Unique constraint failed') && msg.includes('phone')) ||
        (msg.toLowerCase().includes('phone') && (msg.includes('unique') || msg.includes('Unique') || msg.includes('P2002')))
      ) {
        setError("Bu telefon raqami allaqachon ro'yxatdan o'tgan. Boshqa raqam kiriting yoki tizimga kiring.");
      } else if (
        (msg.includes('Unique constraint failed') && msg.includes('email')) ||
        msg.includes('email already exists') ||
        msg.includes('User with this email already exists')
      ) {
        setError("Ushbu email manzili allaqachon ro'yxatdan o'tgan. Boshqa email kiriting yoki tizimga kiring.");
      } else if (
        (msg.includes('Unique constraint failed') && msg.includes('licenseNumber')) ||
        msg.includes('license number already exists') ||
        msg.includes('Doctor profile with this license number already exists')
      ) {
        setError("Ushbu litsenziya raqami allaqachon ro'yxatdan o'tgan. Boshqa litsenziya raqamini kiriting.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-10">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl max-w-xl w-full space-y-6 transition-colors">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-teal text-white flex items-center justify-center mx-auto shadow-md">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t.auth.doctorRegisterTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.doctor.portalSubtitle}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-3">
            <div className="font-bold flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Arizangiz admin tomonidan ko&apos;rib chiqilgandan so&apos;ng shifokor kabinetiga kirishingiz mumkin bo&apos;ladi.
            </p>
            <Link
              href="/doctor/login"
              className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              Shifokor Kirish Sahifasi
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ism & Familiya */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.auth.firstName} *
              </label>
              <input
                type="text"
                required
                disabled={isLoading}
                placeholder="Aziz"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.auth.lastName} *
              </label>
              <input
                type="text"
                required
                disabled={isLoading}
                placeholder="Karimov"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email & Telefon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.auth.email} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="dr.aziz@gippo.uz"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${
                    error?.includes('email manzili allaqachon')
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50`}
                />
              </div>
              {error?.includes('email manzili allaqachon') && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                  Bu email allaqachon mavjud.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.auth.phone}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  disabled={isLoading}
                  placeholder="+998901234567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${
                    error?.includes('telefon raqami allaqachon')
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50`}
                />
              </div>
              {error?.includes('telefon raqami allaqachon') && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                  Bu telefon raqami allaqachon ro&apos;yxatdan o&apos;tgan.
                </p>
              )}
            </div>
          </div>

          {/* Litsenziya raqami & OTM / Ta'lim */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.doctors.licenseNumber} *
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="UZ-MED-LIC-987654"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                OTM / Ta&apos;lim (Education) *
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="Toshkent Tibbiyot Akademiyasi, MD"
                  value={formData.education}
                  onChange={(e) =>
                    setFormData({ ...formData, education: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Tajriba yili & Qabul narxi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.doctors.experience} ({t.doctors.years}) *
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={0}
                  required
                  disabled={isLoading}
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceYears: Number(e.target.value),
                    })
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.doctors.fee} (UZS) *
              </label>
              <input
                type="number"
                step={10000}
                min={0}
                required
                disabled={isLoading}
                value={formData.consultationFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consultationFee: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Mutaxassislik */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {t.doctors.specialtyLabel} *
            </label>
            <select
              disabled={isLoading}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specialtyIds: e.target.value ? [e.target.value] : [],
                })
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">{t.doctors.allSpecialties}</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bio / Tajriba tafsilotlari */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Bio / Tajriba va Ma&apos;lumot *
            </label>
            <textarea
              required
              rows={3}
              disabled={isLoading}
              placeholder="10 yillik klinika tajribasiga ega kardiolog-vrach. Yurak-qon tomir kasalliklarini davolash..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none disabled:opacity-50"
            />
          </div>

          {/* Parol */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {t.auth.password} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={8}
                disabled={isLoading}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 text-xs flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yuborilmoqda...</span>
              </>
            ) : (
              t.auth.registerBtn
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          {t.auth.alreadyAccount}{' '}
          <Link
            href="/doctor/login"
            className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
          >
            {t.auth.loginBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}
