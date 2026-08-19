import React from 'react';
import { SkeletonAppointmentCard, Skeleton } from '@/components/ui/skeletons';

export default function AppointmentsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonAppointmentCard key={i} />
        ))}
      </div>
    </div>
  );
}
