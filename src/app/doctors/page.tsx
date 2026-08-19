'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorsService } from '@/services/doctors';
import { specialtiesService } from '@/services/specialties';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { BookingModal } from '@/components/doctors/BookingModal';
import { DoctorProfile } from '@/types';
import { SkeletonDoctorCard } from '@/components/ui/skeletons';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';

export default function DoctorsPage() {
  const { t } = useLanguageStore();
  const [search, setSearch] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(null);

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['public-doctors', selectedSpecialtyId, search],
    queryFn: () => doctorsService.getPublicDoctors({ specialtyId: selectedSpecialtyId || undefined, search: search || undefined }),
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesService.getAll(),
  });

  // Client-side refined filtering
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const ratingNum = typeof doc.averageRating === 'string' ? parseFloat(doc.averageRating) : doc.averageRating;
      const feeNum = typeof doc.consultationFee === 'string' ? parseFloat(doc.consultationFee) : doc.consultationFee;

      if (minRating > 0 && ratingNum < minRating) return false;
      if (maxPrice < 500000 && feeNum > maxPrice) return false;
      if (onlyOnline && !doc.isOnline) return false;

      return true;
    });
  }, [doctors, minRating, maxPrice, onlyOnline]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t.doctors.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.doctors.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 h-fit sticky top-24 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              {t.doctors.filtersTitle}
            </h3>
            <button
              onClick={() => {
                setSearch('');
                setSelectedSpecialtyId('');
                setMinRating(0);
                setMaxPrice(500000);
                setOnlyOnline(false);
              }}
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              {t.doctors.clearFilters}
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t.doctors.searchLabel}</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={t.doctors.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t.doctors.specialtyLabel}</label>
            <select
              value={selectedSpecialtyId}
              onChange={(e) => setSelectedSpecialtyId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">{t.doctors.allSpecialties}</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t.doctors.minRating}</label>
            <div className="flex items-center gap-2 flex-wrap">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    minRating === r
                      ? 'bg-amber-500 text-white border-amber-500 shadow'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                  }`}
                >
                  {r === 0 ? t.doctors.allRatings : `${r}+ ⭐`}
                </button>
              ))}
            </div>
          </div>

          {/* Maximum Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t.doctors.maxPrice}</label>
              <span className="font-bold text-teal-700 dark:text-teal-400">
                {maxPrice >= 500000 ? t.doctors.unlimitedPrice : `${(maxPrice / 1000).toLocaleString()} ${t.doctors.thousandUzs}`}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="500000"
              step="25000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Online Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.doctors.onlineOnly}</span>
            <input
              type="checkbox"
              checked={onlyOnline}
              onChange={(e) => setOnlyOnline(e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Doctor Grid Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              <strong>{filteredDoctors.length}</strong> {t.doctors.totalFound}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonDoctorCard key={i} />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{t.doctors.noDoctorsFound}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.doctors.noDoctorsFoundDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onBookClick={(doc) => setBookingDoctor(doc)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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
