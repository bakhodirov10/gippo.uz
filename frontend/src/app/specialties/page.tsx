'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { specialtiesService } from '@/services/specialties';
import { Stethoscope, ArrowRight, Loader2 } from 'lucide-react';

export default function SpecialtiesPage() {
  const { data: specialties = [], isLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesService.getAll(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Tibbiy Mutaxassisliklar</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gippo.uz platformasidagi barcha tibbiyot sohalari bo'yicha shifokorlarni saralang
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {specialties.map((s) => (
            <Link
              key={s.id}
              href={`/doctors?specialtyId=${s.id}`}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                  {s.name[0]}
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">
                  {s.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {s.description || `${s.name} sohasidagi malakali shifokorlar va online konsultatsiya`}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
                <span>Shifokorlarni ko'rish</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
