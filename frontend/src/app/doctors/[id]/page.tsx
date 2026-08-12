'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { doctorsService } from '@/services/doctors';
import { reviewsService } from '@/services/reviews';
import { BookingModal } from '@/components/doctors/BookingModal';
import { formatCurrency, formatDate } from '@/lib/cn';
import { useLanguageStore } from '@/stores/useLanguageStore';
import {
  ShieldCheck,
  Star,
  Award,
  BookOpen,
  FileCheck,
  Video,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import { SkeletonDoctorProfile } from '@/components/ui/skeletons';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { t } = useLanguageStore();

  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorsService.getDoctorById(id),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['doctor-reviews', id],
    queryFn: () => reviewsService.getDoctorReviews(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <SkeletonDoctorProfile />;
  }

  if (error || !doctor) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.doctors.notFoundTitle}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.doctors.notFoundDesc}</p>
        <button
          onClick={() => router.push('/doctors')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-teal"
        >
          {t.doctors.backToCatalog}
        </button>
      </div>
    );
  }

  const fullName = doctor.user ? `${doctor.user.firstName} ${doctor.user.lastName}` : 'Shifokor';
  const ratingNum = typeof doctor.averageRating === 'string' ? parseFloat(doctor.averageRating) : doctor.averageRating;
  const reviewsList = reviewsData?.reviews || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.doctors.back}
      </button>

      {/* Hero Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 items-center transition-colors">
        <div className="lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl gradient-teal text-white flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
            {fullName
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Dr. {fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {t.doctors.licensedDoctor}
              </span>
            </div>

            <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
              {doctor.specialties?.map((s) => s.name).join(', ') || 'Specialist'}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-900/60">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-amber-900 dark:text-amber-200">
                  {ratingNum > 0 ? ratingNum.toFixed(1) : '5.0'}
                </span>
                <span className="text-slate-400 font-normal">({doctor.totalReviews} {t.doctors.reviewsCount})</span>
              </div>

              <span className="flex items-center gap-1 font-medium">
                <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {t.doctors.experience}: <strong className="text-slate-900 dark:text-white">{doctor.experienceYears} {t.doctors.years}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Booking Card */}
        <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 space-y-4 text-center lg:text-left">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">{t.doctors.fee}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(doctor.consultationFee)}
            </span>
          </div>

          <button
            onClick={() => setIsBookingOpen(true)}
            className="w-full py-3.5 rounded-xl font-extrabold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 transition-opacity text-sm flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            {t.doctors.onlineVideoConsultation}
          </button>
        </div>
      </div>

      {/* Main Details & Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Bio, Education, License) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {t.doctors.aboutDoctor}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {doctor.bio || t.doctors.defaultBio}
            </p>
          </div>

          {/* Education & License */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {t.doctors.educationAndLicense}
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t.doctors.educationInstitution}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{doctor.education || 'Tashkent Medical Academy'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t.doctors.licenseNumber}</span>
                <span className="font-semibold text-teal-700 dark:text-teal-300">{doctor.licenseNumber}</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {t.doctors.patientReviews} ({reviewsList.length})
            </h3>

            {reviewsList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t.doctors.noReviews}</p>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {rev.patient ? `${rev.patient.firstName} ${rev.patient.lastName}` : 'Bemor'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{formatDate(rev.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isBookingOpen && (
        <BookingModal
          doctor={doctor}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
}
