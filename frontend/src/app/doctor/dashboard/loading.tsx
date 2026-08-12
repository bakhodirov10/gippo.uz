import React from 'react';
import { SkeletonAdminStats, SkeletonTable } from '@/components/ui/skeletons';

export default function DoctorDashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SkeletonAdminStats count={3} />
      <SkeletonTable rows={5} cols={4} />
    </div>
  );
}
