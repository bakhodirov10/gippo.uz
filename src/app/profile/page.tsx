'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { authService } from '@/services/auth';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role } from '@/types';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  return (
    <RoleGuard allowedRoles={[Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN]}>
      <ProfileContent />
    </RoleGuard>
  );
}

function ProfileContent() {
  const { user, setAuth } = useAuthStore();
  const { t } = useLanguageStore();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updatedUser = await authService.updateProfile(formData);
      const token = useAuthStore.getState().accessToken;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (token && refreshToken) {
        setAuth(updatedUser, token, refreshToken);
      }
      setSuccessMsg(t.profile.successMsg);
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t.profile.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.profile.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm space-y-6 transition-colors">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl gradient-teal text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              {user?.firstName} {user?.lastName}
            </h3>
            <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
              {user?.role}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.auth.firstName}</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.auth.lastName}</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.auth.email}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.auth.phone}</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="py-3 px-6 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 text-xs flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.profile.saveBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
