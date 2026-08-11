'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { doctorsService } from '@/services/doctors';
import { specialtiesService } from '@/services/specialties';
import { Building2, Mail, Lock, User, Phone, Award, FileText, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

export default function DoctorRegisterPage() {
  const router = useRouter();

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
    bio: '',
    experienceYears: 5,
    education: '',
    licenseNumber: '',
    consultationFee: 150000,
    specialtyIds: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const toggleSpecialty = (id: string) => {
    setFormData((prev) => {
      const exists = prev.specialtyIds.includes(id);
      return {
        ...prev,
        specialtyIds: exists
          ? prev.specialtyIds.filter((s) => s !== id)
          : [...prev.specialtyIds, id],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.specialtyIds.length === 0) {
      setError('Kamida bitta mutaxassislikni tanlang');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await doctorsService.registerDoctor(formData);
      setIsSubmittedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Shifokor arizasini topshirishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-lg w-full text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
            <Info className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Ariza Qabul Qilindi! Status: PENDING</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hurmatli Dr. {formData.firstName} {formData.lastName}, sizning tibbiy litsenziya va diplom ma'lumotlaringiz admin ekspertlariga yuborildi.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-2">
            <strong className="block font-bold">Muhim xabardorlik:</strong>
            <p>
              Xavfsizlik qoidalariga ko'ra, admin arizangizni ko'rib chiqib <strong>APPROVED</strong> qilgunga qadar shifokorlar katalogida ko'rinmaysiz va konsultatsiya qabul qila olmaysiz.
            </p>
          </div>

          <Link
            href="/doctor/login"
            className="inline-block w-full py-3.5 rounded-xl font-bold text-white gradient-teal text-xs shadow-md"
          >
            Shifokor Portaliga Kirish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-7 h-7 text-teal-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Shifokor Ariza Portaliga Ro'yxatdan O'tish</h1>
          <p className="text-xs text-slate-500">
            Litsenziyalangan vrachlar uchun professional portal
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ismingiz</label>
              <input
                type="text"
                required
                placeholder="Dr. Sherzod"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Familiyangiz</label>
              <input
                type="text"
                required
                placeholder="Karimov"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="doctor@gippo.uz"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Telefon</label>
              <input
                type="tel"
                placeholder="+998901112233"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Parol</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Medical Credentials */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Tibbiy Ma'lumotlar va Litsenziya</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Litsenziya Seriyasi & Raqami
                </label>
                <input
                  type="text"
                  required
                  placeholder="MED-2026-9981"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tajriba Yillari
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Konsultatsiya Narxi (UZS)
              </label>
              <input
                type="number"
                step={10000}
                min={20000}
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ta'lim va Diplom Ma'lumoti
              </label>
              <input
                type="text"
                placeholder="Toshkent Tibbiyot Akademiyasi, Davolash ishi (2015)"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mutaxassisliklarni Tanlang
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {specialties.map((s) => {
                  const selected = formData.specialtyIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSpecialty(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selected
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shifokor Haqida (Bio)
              </label>
              <textarea
                rows={3}
                placeholder="O'z mutaxassisligingiz va ish faoliyatingiz haqida qisqacha ma'lumot..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 text-xs flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Arizani Topshirish (PENDING)'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Shifokor akkountingiz bormi?{' '}
          <Link href="/doctor/login" className="font-bold text-teal-600 hover:underline">
            Portalga kirish
          </Link>
        </div>
      </div>
    </div>
  );
}
