'use client';

import React from 'react';
import dynamic from 'next/dynamic';

export const HeroCanvas = dynamic(() => import('./HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center">
      <div className="w-48 h-48 rounded-full bg-teal-500/10 border border-teal-500/20 animate-pulse" />
    </div>
  ),
});

export const AICanvas = dynamic(() => import('./AICanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] flex items-center justify-center">
      <div className="w-40 h-40 rounded-full bg-violet-500/10 border border-violet-500/20 animate-pulse" />
    </div>
  ),
});

export const Icon3DCanvas = dynamic(() => import('./Icon3DCanvas'), {
  ssr: false,
  loading: () => <div className="w-12 h-12 rounded-2xl bg-teal-500/10 animate-pulse" />,
});
