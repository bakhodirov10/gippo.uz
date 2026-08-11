'use client';

import React from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { User, Mail, Phone, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <RoleGuard allowedRoles={[Role.PATIENT, Role.DOCTOR, Role.ADMIN]}>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Shaxsiy Profil</h1>
          <p className="text-xs text-slate-500 mt-1">Akkount ma'lumotlaringiz va sozlamalar</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b pb-6">
            <div className="w-16 h-16 rounded-2xl gradient-teal text-white flex items-center justify-center font-black text-2xl shadow-md">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 uppercase">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold block flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-teal-600" /> Email Manzil
              </span>
              <span className="font-bold text-slate-800 text-sm">{user?.email}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold block flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-600" /> Telefon Raqam
              </span>
              <span className="font-bold text-slate-800 text-sm">{user?.phone || 'Biriktirilmagan'}</span>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
