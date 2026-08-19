'use client';

import React from 'react';
import Link from 'next/link';
import { DoctorProfile } from '@/types';
import { formatCurrency } from '@/lib/cn';
import { TiltCard } from '@/components/ui/TiltCard';
import { Star, ShieldCheck, Award, Clock, Video } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';

interface DoctorCardProps {
  doctor: DoctorProfile;
  onBookClick?: (doctor: DoctorProfile) => void;
}

export function DoctorCard({ doctor, onBookClick }: DoctorCardProps) {
  const { t } = useLanguageStore();
  const ratingNum = typeof doctor.averageRating === 'string' ? parseFloat(doctor.averageRating) : doctor.averageRating;
  const fullName = doctor.user ? `${doctor.user.firstName} ${doctor.user.lastName}` : 'Shifokor';
  const primarySpecialty = doctor.specialties && doctor.specialties.length > 0 ? doctor.specialties[0].name : 'Specialist';

  return (
    <TiltCard maxTilt={6} className="h-full">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-2xl hover:border-teal-300/80 dark:hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between h-full group">
        <div>
          {/* Header section with photo and status */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl gradient-teal text-white flex items-center justify-center font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
                {fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              {doctor.isOnline && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center animate-pulse" title="Online" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  Dr. {fullName}
                </h3>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  {t.doctors.license}
                </span>
              </div>

              <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">{primarySpecialty}</p>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {ratingNum > 0 ? ratingNum.toFixed(1) : '5.0'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">({doctor.totalReviews || 0} {t.doctors.reviewsCount})</span>
              </div>
            </div>
          </div>

          {/* Experience & Bio */}
          <div className="space-y-2 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 font-medium">
                <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                {t.doctors.experience}: <strong className="text-slate-800 dark:text-white">{doctor.experienceYears} {t.doctors.years}</strong>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Online: <strong className="text-emerald-600 dark:text-emerald-400">{t.doctors.available}</strong>
              </span>
            </div>

            {doctor.bio && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {doctor.bio}
              </p>
            )}
          </div>
        </div>

        {/* Footer & Pricing */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.doctors.fee}</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(doctor.consultationFee)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/doctors/${doctor.id}`}
              className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              {t.doctors.viewProfile}
            </Link>
            <button
              onClick={() => onBookClick ? onBookClick(doctor) : null}
              className="px-4 py-2 text-xs font-bold text-white gradient-teal rounded-xl shadow-md shadow-teal-500/20 hover:opacity-95 transition-opacity flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              {t.doctors.bookConsultation}
            </button>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
