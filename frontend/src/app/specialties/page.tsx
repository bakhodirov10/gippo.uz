'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { specialtiesService } from '@/services/specialties';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function SpecialtiesPage() {
  const { t } = useLanguageStore();

  const { data: specialties = [], isLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesService.getAll(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t.specialties.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.specialties.subtitle}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {specialties.map((s) => (
            <Link
              key={s.id}
              href={`/doctors?specialtyId=${s.id}`}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-600 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                  {s.name[0]}
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  {s.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {s.description || `${s.name} ${t.specialties.defaultDesc}`}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>{t.specialties.viewDoctors}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
