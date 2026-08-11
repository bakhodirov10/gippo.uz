'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Role } from '@/types';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        if (user.role === Role.DOCTOR) {
          router.push('/doctor/dashboard');
        } else if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Xavfsizlik va vakolatlar tekshirilmoqda...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ruxsat Berilmadi (403 Forbidden)</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Sizda ushbu sahifaga kirish uchun yetarli xuquq va vakolatlar mavjud emas.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
