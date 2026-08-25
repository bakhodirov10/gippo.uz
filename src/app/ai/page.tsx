'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { aiService, ChatResponse } from '@/services/ai';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { AIConversation } from '@/types';
import {
  Bot,
  Send,
  ShieldAlert,
  PhoneCall,
  User,
  Info,
  PlusCircle,
  MessageSquare,
  History,
  LogIn,
  Clock,
  Menu,
  X,
  RefreshCw,
  Brain,
  Globe,
  Zap,
  Sparkles,
  ChevronDown,
  Check,
  Stethoscope,
  Sliders,
  Cpu,
} from 'lucide-react';
import { SkeletonAIMessage } from '@/components/ui/skeletons';

interface UIFormattedMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  content: string;
  createdAt?: string;
  disclaimer?: string;
  isEmergency?: boolean;
}

const AVAILABLE_MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Tezkor',
    desc: 'Tezkor tibbiy maslahat va umumiy savollar uchun',
    icon: Zap,
    isThinking: false,
    color: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    badge: 'Aqlli',
    desc: 'Murakkab tahlil va aniq tibbiy tavsiyalar',
    icon: Sparkles,
    isThinking: false,
    color: 'text-teal-500 dark:text-teal-400',
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-01-21',
    name: 'Gemini Thinking',
    badge: 'Reasoning',
    desc: 'Qadamma-qadam mantiqiy fikrlash (Reasoning)',
    icon: Brain,
    isThinking: true,
    color: 'text-purple-500 dark:text-purple-400',
  },
  {
    id: 'gemini-2.0-flash-lite-preview-02-05',
    name: 'Gemini Flash-Lite',
    badge: 'Yengil',
    desc: 'Minimal kechikish bilan qisqa javoblar',
    icon: Cpu,
    isThinking: false,
    color: 'text-blue-500 dark:text-blue-400',
  },
];

export default function AIAssistantPage() {
  const { t } = useLanguageStore();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [inputMessage, setInputMessage] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [thinkingEffort, setThinkingEffort] = useState<'low' | 'medium' | 'high'>('medium');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [searchGrounding, setSearchGrounding] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModelConfig = useMemo(() => {
    return AVAILABLE_MODELS.find((m) => m.id === aiModel) || AVAILABLE_MODELS[0];
  }, [aiModel]);

  const [localMessages, setLocalMessages] = useState<UIFormattedMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ASSISTANT',
      content: t.ai.welcomeMessage,
      disclaimer: t.ai.disclaimer,
    },
  ]);

  const {
    data: conversations = [],
    isLoading: isConversationsLoading,
    isError: isConversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => aiService.getUserConversations(),
    enabled: !!user,
    staleTime: 30000,
  });

  const {
    data: activeConversationDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['ai-conversation', activeConversationId],
    queryFn: () => aiService.getConversationById(activeConversationId!),
    enabled: !!user && !!activeConversationId,
    staleTime: 30000,
  });

  const displayMessages = useMemo(() => {
    if (activeConversationId && activeConversationDetail?.messages) {
      return activeConversationDetail.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        createdAt: m.createdAt,
        disclaimer: m.sender === 'ASSISTANT' ? t.ai.disclaimer : undefined,
      }));
    }
    return localMessages;
  }, [activeConversationId, activeConversationDetail, localMessages, t]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isDetailLoading]);

  const chatMutation = useMutation({
    mutationFn: (payload: { 
      message: string; 
      conversationId?: string;
      thinkingEffort?: 'low' | 'medium' | 'high';
      aiModel?: string;
      searchGrounding?: boolean;
    }) => aiService.sendMessage(payload),

    onMutate: async (newPayload) => {
      const optimisticMsg: UIFormattedMessage = {
        id: `opt-${Date.now()}`,
        sender: 'USER',
        content: newPayload.message,
      };
      setLocalMessages((prev) => [...prev, optimisticMsg]);
    },

    onSuccess: (data: ChatResponse) => {
      if (data.conversationId) {
        setActiveConversationId(data.conversationId);
      }
      const aiMsg: UIFormattedMessage = {
        id: data.messageId || String(Date.now()),
        sender: 'ASSISTANT',
        content: data.reply,
        disclaimer: data.disclaimer || t.ai.disclaimer,
        isEmergency: data.isEmergency,
      };
      setLocalMessages((prev) => [...prev, aiMsg]);
      if (data.isEmergency) {
        setEmergencyAlert(data.emergencyNotice || t.ai.emergencyAlert);
      }
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
        if (data.conversationId) {
          queryClient.invalidateQueries({
            queryKey: ['ai-conversation', data.conversationId],
          });
        }
      }
    },

    onError: (err: any) => {
      const axiosErr = err as AxiosError<any>;
      const backendMsg: string = axiosErr.response?.data?.message || axiosErr.message || t.common.error;
      setLocalMessages((prev) => [
        ...prev,
        { id: String(Date.now()), sender: 'ASSISTANT', content: `Error: ${backendMsg}`, disclaimer: t.ai.disclaimer },
      ]);
    },
  });

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || chatMutation.isPending) return;
    if (!textToSend) setInputMessage('');
    chatMutation.mutate({
      message: text,
      conversationId: activeConversationId,
      thinkingEffort: activeModelConfig.isThinking ? thinkingEffort : undefined,
      aiModel,
      searchGrounding,
    });
  };

  const handleStartNewChat = () => {
    setActiveConversationId(undefined);
    setLocalMessages([
      { id: 'welcome-new', sender: 'ASSISTANT', content: t.ai.welcomeMessage, disclaimer: t.ai.disclaimer },
    ]);
    setEmergencyAlert(null);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setEmergencyAlert(null);
    setIsSidebarOpen(false);
  };

  const suggestedQuestions = [t.ai.suggested1, t.ai.suggested2, t.ai.suggested3, t.ai.suggested4];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-white/90 via-slate-50/90 to-teal-50/40 dark:from-slate-900/90 dark:via-slate-900/95 dark:to-teal-950/20 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-teal-500/5 transition-all">
        <div className="absolute top-0 right-1/4 w-72 h-36 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute -bottom-8 left-1/3 w-60 h-28 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-2xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300 animate-pulse" />
              <div className="relative w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-500/25">
                <Bot className="w-7 h-7 text-white drop-shadow-md" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t.ai.title}</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-teal-500/15 to-cyan-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/30">
                  <Sparkles className="w-3 h-3" />
                  {t.ai.freeBadge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                {t.ai.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {user && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                {isSidebarOpen ? <X className="w-4 h-4 text-rose-500" /> : <Menu className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                <span>{t.ai.historyTitle || 'Suhbatlar'}</span>
              </button>
            )}
            <button
              onClick={handleStartNewChat}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-extrabold shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.ai.newChat || 'Yangi muloqot'}</span>
            </button>
          </div>
        </div>
      </div>

      {!user && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <span>{t.ai.guestBanner || 'Tizimga kirish orqali AI suhbatlaringiz tarixini saqlashingiz mumkin.'}</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.ai.loginToSave || 'Kirish'}</span>
          </Link>
        </div>
      )}

      {emergencyAlert && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xl shadow-rose-500/20 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <strong className="block font-black text-sm tracking-wide">{t.ai.emergencyAlert}</strong>
              <p className="text-xs text-rose-100 mt-0.5 font-medium">{emergencyAlert}</p>
            </div>
          </div>
          <a
            href="tel:103"
            className="px-5 py-2.5 bg-white text-rose-700 font-black text-xs rounded-2xl shadow-lg shrink-0 hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            {t.ai.call103}
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {user && (
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block md:col-span-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xl space-y-4 max-h-[640px] overflow-y-auto transition-colors`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 px-1">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {t.ai.historyTitle || 'Muloqotlar tarixi'}
              </h3>
              <button
                onClick={() => refetchConversations()}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Yangilash"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={handleStartNewChat}
              className="w-full py-3 px-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.ai.newChat || 'Yangi muloqot'}</span>
            </button>
            {isConversationsLoading ? (
              <div className="space-y-2 py-6 text-center text-xs text-slate-400">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Tarix yuklanmoqda...</p>
              </div>
            ) : isConversationsError ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs text-center border border-rose-200 dark:border-rose-900/40">
                <p>Tarixni yuklab bo&apos;lmadi</p>
                <button onClick={() => refetchConversations()} className="mt-1 font-bold underline">Qayta urinish</button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p>{t.ai.noHistory || 'Saqlangan suhbatlar yo\'q'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv: AIConversation) => {
                  const isActive = conv.id === activeConversationId;
                  const dateStr = new Date(conv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs transition-all border group relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/60 dark:to-cyan-950/40 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-100 font-bold shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-r" />}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="truncate max-w-[130px] block font-semibold">{conv.title || 'AI Muloqot'}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{dateStr}</span>
                      </div>
                      {conv.messages && conv.messages[0] && <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{conv.messages[0].content}</p>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className={`${user ? 'md:col-span-3' : 'md:col-span-4'} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[640px] transition-colors`}>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-slate-950/40">
            {isDetailLoading ? (
              <div className="space-y-3 py-6">
                <SkeletonAIMessage from="ai" />
                <SkeletonAIMessage from="user" />
                <SkeletonAIMessage from="ai" />
              </div>
            ) : isDetailError ? (
              <div className="p-8 text-center text-xs text-rose-600 dark:text-rose-400 space-y-3">
                <p className="font-semibold">Suhbat tarixini yuklashda xatolik yuz berdi.</p>
                <button onClick={() => refetchDetail()} className="px-5 py-2.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-2xl font-bold shadow-sm hover:scale-105 transition-all">Qayta yuklash</button>
              </div>
            ) : (
              displayMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                    msg.sender === 'USER'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-600 dark:to-cyan-600 text-white rounded-tr-none shadow-teal-600/10'
                      : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none space-y-3 backdrop-blur-sm'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1.5 opacity-90">
                      {msg.sender === 'USER' ? (
                        <>
                          <span>{t.ai.you}</span>
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white"><User className="w-3 h-3" /></div>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center"><Stethoscope className="w-3 h-3" /></div>
                          <span className="text-teal-700 dark:text-teal-300 font-extrabold tracking-wide">Gippo AI Maslahatchi</span>
                        </>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    {msg.sender === 'ASSISTANT' && msg.disclaimer && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-500/20">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <span className="leading-snug">{msg.disclaimer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {chatMutation.isPending && (
              <div className="space-y-3 py-2"><SkeletonAIMessage from="ai" /></div>
            )}
            <div ref={chatBottomRef} />
          </div>

          <div className="px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 z-20">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative" ref={modelDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-400 dark:hover:border-teal-600 text-xs font-bold transition-all shadow-sm"
                >
                  <activeModelConfig.icon className={`w-3.5 h-3.5 ${activeModelConfig.color}`} />
                  <span>{activeModelConfig.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 font-extrabold uppercase">{activeModelConfig.badge}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isModelDropdownOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-72 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 backdrop-blur-xl">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Gemini Modellari</div>
                    {AVAILABLE_MODELS.map((model) => {
                      const isSelected = model.id === aiModel;
                      const IconComponent = model.icon;
                      return (
                        <button key={model.id} onClick={() => { setAiModel(model.id); setIsModelDropdownOpen(false); }} className={`w-full text-left p-2.5 rounded-2xl text-xs transition-all flex items-start justify-between gap-2 ${isSelected ? 'bg-teal-500/15 text-teal-900 dark:text-teal-200 border border-teal-500/30 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'}`}>
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5"><IconComponent className={`w-4 h-4 ${model.color}`} /></div>
                            <div>
                              <div className="font-bold flex items-center gap-1.5"><span>{model.name}</span><span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{model.badge}</span></div>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{model.desc}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSearchGrounding(!searchGrounding)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${searchGrounding ? 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300 shadow-sm shadow-blue-500/10' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="Gemini javoblarini real vaqtda Google qidiruv bilan tasdiqlash"
              >
                <Globe className={`w-3.5 h-3.5 ${searchGrounding ? 'text-blue-500 dark:text-blue-400 animate-spin-slow' : ''}`} />
                <span>Google Search</span>
                {searchGrounding && <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping" />}
              </button>
            </div>
            {activeModelConfig.isThinking && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-purple-500/30 shadow-inner">
                <div className="px-2 flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400"><Brain className="w-3.5 h-3.5" /><span className="hidden sm:inline">Tahlil:</span></div>
                {(['low', 'medium', 'high'] as const).map((effort) => {
                  const isActive = thinkingEffort === effort;
                  const labels = { low: 'Tez (1K)', medium: 'Balans (4K)', high: 'Chuqur (8K)' };
                  return (
                    <button key={effort} type="button" onClick={() => setThinkingEffort(effort)} className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all ${isActive ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                      {labels[effort]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {displayMessages.length <= 2 && (
            <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800/60 flex gap-2 overflow-x-auto">
              {suggestedQuestions.map((q, idx) => (
                <button key={idx} onClick={() => handleSend(q)} className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0 transition-all shadow-sm">
                  💡 {q}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                placeholder={t.ai.placeholder}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={chatMutation.isPending}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all disabled:opacity-50"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0"
            >
              <span>{t.ai.send}</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
