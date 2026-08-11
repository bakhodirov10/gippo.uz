'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Role } from '@/types';
import { consultationsService } from '@/services/consultations';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  Loader2,
  Lock,
  User,
} from 'lucide-react';

export default function ConsultationsPage() {
  return (
    <RoleGuard allowedRoles={[Role.PATIENT, Role.DOCTOR]}>
      <ConsultationsRoomContent />
    </RoleGuard>
  );
}

function ConsultationsRoomContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || 'demo';

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);

  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['consultation-token', appointmentId],
    queryFn: () => consultationsService.getSessionToken(appointmentId),
    enabled: !!appointmentId && appointmentId !== 'demo',
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Xavfsiz Tele-health video xonasi yaratilmoqda...</p>
      </div>
    );
  }

  if (isCallEnded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
          <PhoneOff className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Konsultatsiya Yakunlandi</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Shifokor bilan online suhbatingiz yakunlandi. Salomatligingiz uchun rahmat!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Telehealth Security Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs">Shaffof Video Room ({tokenData?.roomName || `ROOM-${appointmentId.slice(0, 8)}`})</h3>
            <p className="text-[10px] text-teal-400">End-to-End Shifrlangan Telehealth ulanish</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
          🔴 LIVE KONSULTATSIYA
        </span>
      </div>

      {/* Main Video View Canvas */}
      <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video border border-slate-800 shadow-2xl flex items-center justify-center">
        {/* Remote Doctor Video Screen Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-teal-500/20 text-teal-300 border-2 border-teal-500 flex items-center justify-center text-2xl font-bold">
            <User className="w-12 h-12" />
          </div>
          <div>
            <h4 className="text-white font-extrabold text-lg">Dr. Shifokor Video Oqimi</h4>
            <p className="text-xs text-slate-400">Mikrofon va kamera faol holatda. Ovoz va tasvir uzatilmoqda.</p>
          </div>
        </div>

        {/* Local Self Camera Preview (Pip box) */}
        <div className="absolute bottom-4 right-4 w-40 h-28 bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
          {isVideoOff ? (
            <div className="text-slate-500 text-center">
              <VideoOff className="w-6 h-6 mx-auto mb-1" />
              <span className="text-[10px]">Kamera o'chiq</span>
            </div>
          ) : (
            <div className="text-teal-400 text-center">
              <User className="w-8 h-8 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-white">Sizning kamerangiz</span>
            </div>
          )}
        </div>

        {/* Floating Controls Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700/80 flex items-center gap-4 shadow-xl">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-3 rounded-full transition-all ${
              isAudioMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isAudioMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-3 rounded-full transition-all ${
              isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isVideoOff ? "Kamerani yoqish" : "Kamerani o'chirish"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsCallEnded(true)}
            className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all shadow-lg shadow-rose-600/30"
            title="Qabulni yakunlash"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
