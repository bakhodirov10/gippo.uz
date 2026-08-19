import React from 'react';
import { SkeletonConversation, SkeletonAIMessage } from '@/components/ui/skeletons';

export default function AILoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 h-[85vh]">
      <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 hidden md:block">
        <SkeletonConversation />
      </div>
      <div className="md:col-span-3 bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
        <div className="space-y-4">
          <SkeletonAIMessage from="user" />
          <SkeletonAIMessage from="ai" />
          <SkeletonAIMessage from="user" />
        </div>
      </div>
    </div>
  );
}
