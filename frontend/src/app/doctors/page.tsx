'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorsService } from '@/services/doctors';
import { specialtiesService } from '@/services/specialties';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { BookingModal } from '@/components/doctors/BookingModal';
import { DoctorProfile } from '@/types';
import { Search, Filter, Star, SlidersHorizontal, Users, Loader2 } from 'lucide-react';

export default function DoctorsPage() {
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shifokorlar Katalogi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Litsenziyalangan professional vrachlarni qidirish, reyting va narx bo'yicha saralash
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 h-fit sticky top-24 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-600" />
              Filtrlar
            </h3>
            <button
              onClick={() => {
                setSearch('');
                setSelectedSpecialtyId('');
                setMinRating(0);
                setMaxPrice(500000);
                setOnlyOnline(false);
              }}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              Tozalash
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Shifokor Ismi</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Masalan: Jamshid..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mutaxassislik</label>
            <select
              value={selectedSpecialtyId}
              onChange={(e) => setSelectedSpecialtyId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">Barchasi</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Minimal Reyting</label>
            <div className="flex items-center gap-2">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    minRating === r
                      ? 'bg-amber-500 text-white border-amber-500 shadow'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {r === 0 ? 'Barchasi' : `${r}+ ⭐`}
                </button>
              ))}
            </div>
          </div>

          {/* Maximum Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Maksimal Narx</label>
              <span className="font-bold text-teal-700">
                {maxPrice >= 500000 ? 'Chekloviz' : `${(maxPrice / 1000).toLocaleString()} ming UZS`}
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
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Hozir Online shifokorlar</span>
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
            <span className="text-xs font-semibold text-slate-500">
              Jami <strong>{filteredDoctors.length}</strong> ta shifokor topildi
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Ushbu parametrlar bo'yicha shifokorlar topilmadi</h3>
              <p className="text-xs text-slate-500">Filtrlarni tozalab qayta urunib ko'ring.</p>
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
