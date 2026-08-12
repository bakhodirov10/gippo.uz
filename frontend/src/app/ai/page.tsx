'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { aiService, ChatResponse } from '@/services/ai';
import { useLanguageStore } from '@/stores/useLanguageStore';

import {
  Bot,
  Send,
  ShieldAlert,
  PhoneCall,
  Trash2,
  User,
  Info,
} from 'lucide-react';
import { SkeletonAIMessage } from '@/components/ui/skeletons';

interface LocalMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  content: string;
  disclaimer?: string;
  isEmergency?: boolean;
  emergencyNotice?: string;
}

export default function AIAssistantPage() {
  const { t } = useLanguageStore();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ASSISTANT',
      content: t.ai.welcomeMessage,
      disclaimer: t.ai.disclaimer,
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (payload: { message: string; conversationId?: string }) => aiService.sendMessage(payload),
    onSuccess: (data: ChatResponse) => {
      if (data.conversationId) {
        setActiveConversationId(data.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: data.messageId || String(Date.now()),
          sender: 'ASSISTANT',
          content: data.reply,
          disclaimer: data.disclaimer || t.ai.disclaimer,
          isEmergency: data.isEmergency,
          emergencyNotice: data.emergencyNotice,
        },
      ]);

      if (data.isEmergency) {
        setEmergencyAlert(
          data.emergencyNotice || t.ai.emergencyAlert
        );
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

      setMessages((prev) => [
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

    const userMsg: LocalMessage = {
      id: String(Date.now()),
      sender: 'USER',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    chatMutation.mutate({
      message: text,
      conversationId: activeConversationId,
    });
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'ASSISTANT',
        content: t.ai.chatCleared,
        disclaimer: t.ai.disclaimer,
      },
    ]);
    setActiveConversationId(undefined);
    setEmergencyAlert(null);
  };

  const suggestedQuestions = [
    t.ai.suggested1,
    t.ai.suggested2,
    t.ai.suggested3,
    t.ai.suggested4,
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Safety Warning */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-teal text-white flex items-center justify-center font-bold shadow-md">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">{t.ai.title}</h1>
              <span className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                {t.ai.freeBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.ai.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          {t.ai.clearChat}
        </button>
      </div>

      {/* Emergency Banner UI if triggered */}
      {emergencyAlert && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-xl animate-bounce flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 shrink-0" />
            <div>
              <strong className="block font-bold text-sm">{t.ai.emergencyAlert}</strong>
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

      {/* Main Chat Box Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col h-[600px] transition-colors">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((msg) => (
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
                      <span className="text-teal-700 dark:text-teal-400">Gippo AI</span>
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
          ))}

          {chatMutation.isPending && (
            <div className="space-y-2">
              <SkeletonAIMessage from="ai" />
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Prompts Pill */}
        {messages.length <= 2 && (
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
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
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
  );
}
