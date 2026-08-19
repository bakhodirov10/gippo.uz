import React from 'react';
import { SkeletonAdminStats, SkeletonTable } from '@/components/ui/skeletons';

export default function AdminDashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SkeletonAdminStats count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkeletonTable rows={6} cols={3} />
        <SkeletonTable rows={6} cols={3} />
      </div>
    </div>
  );
}
