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

  // Local unpersisted messages (for new chat before first backend save, or guest users)
  const [localMessages, setLocalMessages] = useState<UIFormattedMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ASSISTANT',
      content: t.ai.welcomeMessage,
      disclaimer: t.ai.disclaimer,
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ─── Query 1: Fetch User Conversations History ──────────────────────────────
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

  // ─── Query 2: Fetch Active Conversation Details & Messages ───────────────
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

  // ─── Compute Displayed Messages ─────────────────────────────────────────────
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

  // ─── Mutation: Send AI Message ──────────────────────────────────────────────
  const chatMutation = useMutation({
    mutationFn: (payload: { message: string; conversationId?: string }) =>
      aiService.sendMessage(payload),

    onMutate: async (newPayload) => {
      // Optimistic user message addition
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

      // Refetch queries if logged in
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
      const httpStatus = axiosErr.response?.status;
      const backendMsg: string =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        t.common.error;

      const uiMessage = httpStatus
        ? `Server error (${httpStatus}): ${backendMsg}`
        : `Network error: ${backendMsg}.`;

      setLocalMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'ASSISTANT',
          content: uiMessage,
          disclaimer: t.ai.disclaimer,
        },
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
      thinkingEffort,
      aiModel,
      searchGrounding,
    });
  };

  const handleStartNewChat = () => {
    setActiveConversationId(undefined);
    setLocalMessages([
      {
        id: 'welcome-new',
        sender: 'ASSISTANT',
        content: t.ai.welcomeMessage,
        disclaimer: t.ai.disclaimer,
      },
    ]);
    setEmergencyAlert(null);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setEmergencyAlert(null);
    setIsSidebarOpen(false);
  };

  const suggestedQuestions = [
    t.ai.suggested1,
    t.ai.suggested2,
    t.ai.suggested3,
    t.ai.suggested4,
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Mobile Drawer Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-teal text-white flex items-center justify-center font-bold shadow-md">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {t.ai.title}
              </h1>
              <span className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                {t.ai.freeBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.ai.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {user && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {isSidebarOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
                <span>{t.ai.historyTitle || 'Suhbatlar'}</span>
              </button>
            )}

            <button
              onClick={handleStartNewChat}
              className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.ai.newChat || 'Yangi muloqot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Notice Banner */}
      {!user && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {t.ai.guestBanner ||
                'Tizimga kirish orqali AI suhbatlaringiz tarixini saqlashingiz mumkin.'}
            </span>
          </div>
          <Link
            href="/login"
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.ai.loginToSave || 'Kirish'}</span>
          </Link>
        </div>
      )}

      {/* Emergency Alert Banner */}
      {emergencyAlert && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-xl animate-bounce flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 shrink-0" />
            <div>
              <strong className="block font-bold text-sm">
                {t.ai.emergencyAlert}
              </strong>
              <p className="text-xs text-rose-100 mt-0.5">{emergencyAlert}</p>
            </div>
          </div>
          <a
            href="tel:103"
            className="px-4 py-2 bg-white text-rose-700 font-extrabold text-xs rounded-xl shadow shrink-0 hover:bg-rose-50 flex items-center gap-1"
          >
            <PhoneCall className="w-4 h-4" />
            {t.ai.call103}
          </a>
        </div>
      )}

      {/* Main Grid: Sidebar + Chat Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Sidebar Panel (Desktop & Mobile Drawer) */}
        {user && (
          <div
            className={`${
              isSidebarOpen ? 'block' : 'hidden'
            } md:block md:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-lg space-y-4 max-h-[600px] overflow-y-auto transition-colors`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {t.ai.historyTitle || 'Muloqotlar tarixi'}
              </h3>
              <button
                onClick={() => refetchConversations()}
                className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                title="Yangilash"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleStartNewChat}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.ai.newChat || 'Yangi muloqot'}</span>
            </button>

            {isConversationsLoading ? (
              <div className="space-y-2 py-4 text-center text-xs text-slate-400">
                <p>Yuklanmoqda...</p>
              </div>
            ) : isConversationsError ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs text-center">
                <p>Tarixni yuklab bo&apos;lmadi</p>
                <button
                  onClick={() => refetchConversations()}
                  className="mt-1 font-bold underline"
                >
                  Qayta urinish
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p>{t.ai.noHistory || 'Saqlangan suhbatlar yo\'q'}</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {conversations.map((conv: AIConversation) => {
                  const isActive = conv.id === activeConversationId;
                  const dateStr = new Date(conv.updatedAt).toLocaleDateString(
                    undefined,
                    { month: 'short', day: 'numeric' },
                  );
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs transition-all border ${
                        isActive
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-100 font-bold shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="truncate max-w-[140px] block font-semibold">
                          {conv.title || 'AI Muloqot'}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>
                      {conv.messages && conv.messages[0] && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {conv.messages[0].content}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat Messages Box */}
        <div
          className={`${
            user ? 'md:col-span-3' : 'md:col-span-4'
          } bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col h-[600px] transition-colors`}
        >
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            {isDetailLoading ? (
              <div className="space-y-3 py-6">
                <SkeletonAIMessage from="ai" />
                <SkeletonAIMessage from="user" />
                <SkeletonAIMessage from="ai" />
              </div>
            ) : isDetailError ? (
              <div className="p-6 text-center text-xs text-rose-600 dark:text-rose-400 space-y-2">
                <p>Suhbat tarixini yuklashda xatolik yuz berdi.</p>
                <button
                  onClick={() => refetchDetail()}
                  className="px-4 py-2 bg-rose-100 dark:bg-rose-950 rounded-xl font-bold hover:underline"
                >
                  Qayta yuklash
                </button>
              </div>
            ) : (
              displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'USER' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'USER'
                        ? 'bg-teal-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none space-y-2'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1 opacity-80">
                      {msg.sender === 'USER' ? (
                        <>
                          <span>{t.ai.you}</span>
                          <User className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span className="text-teal-700 dark:text-teal-400">
                            Gippo AI
                          </span>
                        </>
                      )}
                    </div>

                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Medical Disclaimer Banner */}
                    {msg.sender === 'ASSISTANT' && msg.disclaimer && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/60 p-2 rounded-xl">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{msg.disclaimer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {chatMutation.isPending && (
              <div className="space-y-2">
                <SkeletonAIMessage from="ai" />
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* AI Controls Bar */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 sm:gap-4 shadow-sm z-10">
            {/* Model Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
              <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none outline-none pr-2"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.0-flash-lite-preview-02-05">Gemini Flash-Lite</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp</option>
                <option value="gemini-2.0-flash-thinking-exp-01-21">Gemini Thinking</option>
              </select>
            </div>

            {/* Google Search Grounding */}
            <button
              onClick={() => setSearchGrounding(!searchGrounding)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                searchGrounding
                  ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-inner'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Javoblarni Google Qidiruv orqali tekshirish"
            >
              <Globe className={`w-3.5 h-3.5 ${searchGrounding ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span>Google Search</span>
            </button>

            {/* Thinking Effort */}
            {(aiModel.includes('thinking') || aiModel.includes('pro-exp') || aiModel.includes('reasoning')) && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-1.5 border border-purple-200/50 dark:border-purple-700/50 ml-auto sm:ml-0 hover:border-purple-300 transition-colors">
                <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <select
                  value={thinkingEffort}
                  onChange={(e) => setThinkingEffort(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-purple-700 dark:text-purple-300 focus:outline-none cursor-pointer appearance-none outline-none pr-2"
                  title="Fikrlash chuqurligi (Faqat qiyin masalalar uchun)"
                >
                  <option value="low">Tez (Low)</option>
                  <option value="medium">Balans (Medium)</option>
                  <option value="high">Chuqur (High)</option>
                </select>
              </div>
            )}
          </div>

          {/* Suggested Prompts Pill */}
          {displayMessages.length <= 2 && (
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 dark:hover:text-teal-300 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shrink-0 transition-colors"
                >
                  💡 {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <input
              type="text"
              placeholder={t.ai.placeholder}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={chatMutation.isPending}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className="px-5 py-3 rounded-2xl gradient-teal text-white font-bold text-xs shadow-md shadow-teal-500/20 disabled:opacity-50 hover:opacity-95 transition-all flex items-center gap-1.5"
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
