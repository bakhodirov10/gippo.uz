'use client';

import React from 'react';

// ─── Base Primitive Skeleton ──────────────────────────────────────────────────
export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-busy="true"
      aria-hidden="true"
      style={style}
      className={`skeleton rounded-xl bg-slate-200/80 dark:bg-slate-800/80 select-none ${className}`}
    />
  );
}

// ─── Typography & Avatar Skeletons ───────────────────────────────────────────
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-12 h-12 rounded-2xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  };
  return <Skeleton className={sizeClasses[size]} />;
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-10 w-28 rounded-xl ${className}`} />;
}

// ─── Composite Doctor Card Skeleton (100% matches DoctorCard layout) ─────────
export function SkeletonDoctorCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <SkeletonAvatar size="lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        {/* Experience & Bio */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <SkeletonButton className="w-16 h-8" />
          <SkeletonButton className="w-24 h-8" />
        </div>
      </div>
    </div>
  );
}

// ─── Doctor Profile Detail Skeleton (matches /doctors/[id]) ──────────────────
export function SkeletonDoctorProfile() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <SkeletonAvatar size="xl" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-32" />
            <SkeletonButton className="w-36 h-11" />
          </div>
        </div>
      </div>

      {/* Tabs / Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <SkeletonText lines={4} />
          <Skeleton className="h-5 w-48 pt-4" />
          <SkeletonText lines={3} />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Appointment Card Skeleton (matches /appointments) ───────────────────────
export function SkeletonAppointmentCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="sm" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="h-3 w-36" />
        <SkeletonButton className="w-24 h-7" />
      </div>
    </div>
  );
}

// ─── Stats / Admin Metrics Skeleton ──────────────────────────────────────────
export function SkeletonAdminStats({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      ))}
    </div>
  );
}

// ─── Table / Admin Rows Skeleton ─────────────────────────────────────────────
export function SkeletonTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className={`h-3.5 ${j === 0 ? 'w-32' : 'w-20'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Chat Skeletons ────────────────────────────────────────────────────────
export function SkeletonAIMessage({ from = 'ai' }: { from?: 'user' | 'ai' }) {
  return (
    <div className={`flex ${from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
      {from === 'ai' && <SkeletonAvatar size="sm" />}
      <div className={`max-w-[75%] rounded-2xl p-4 space-y-2 ${from === 'user' ? 'bg-teal-600/20' : 'bg-slate-800 dark:bg-slate-900'}`}>
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function SkeletonConversation() {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl bg-slate-800/50 dark:bg-slate-900/50 space-y-2">
          <Skeleton className="h-3.5 w-36 bg-slate-700 dark:bg-slate-800" />
          <Skeleton className="h-2.5 w-20 bg-slate-700 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard Full Grid Skeleton ─────────────────────────────────────────────
export function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SkeletonAdminStats count={3} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-48" />
          <SkeletonAppointmentCard />
          <SkeletonAppointmentCard />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <SkeletonTable rows={4} cols={2} />
        </div>
      </div>
    </div>
  );
}
