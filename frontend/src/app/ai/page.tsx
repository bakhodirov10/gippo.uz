'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { aiService, ChatResponse } from '@/services/ai';
import { useAuthStore } from '@/stores/useAuthStore';

// Endpoint: POST http://localhost:3000/api/v1/ai/chat
// Auth:     @Public() — no token required (optional userId from JWT if present)
import {
  Bot,
  Send,
  ShieldAlert,
  PhoneCall,
  Trash2,
  User,
  Loader2,
  Info,
  AlertCircle,
} from 'lucide-react';

interface LocalMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  content: string;
  disclaimer?: string;
  isEmergency?: boolean;
  emergencyNotice?: string;
}

export default function AIAssistantPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ASSISTANT',
      content:
        "Assalomu alaykum! Men Gippo.uz AI Tibbiy Assistentiman. Qanday tibbiy alomatlar yoki savollaringiz bor? Qulay tarzda yozishingiz mumkin.",
      disclaimer: "Disclaimer: Gippo AI is an informational tool and does NOT replace professional medical advice, diagnosis, or treatment. Always consult a verified doctor for health concerns. In case of emergency, call 103 immediately.",
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
          disclaimer: data.disclaimer || "Disclaimer: Gippo AI is an informational tool and does NOT replace professional medical advice, diagnosis, or treatment.",
          isEmergency: data.isEmergency,
          emergencyNotice: data.emergencyNotice,
        },
      ]);

      if (data.isEmergency) {
        setEmergencyAlert(
          data.emergencyNotice || "Favqulodda alomatlar aniqlandi! Zudlik bilan 103 Tez Yordam xizmatiga murojaat qiling!"
        );
      }
    },
    onError: (err: any) => {
      // Structured dev logging — AxiosError carries .response, plain Error does not
      if (process.env.NODE_ENV !== 'production') {
        const axiosErr = err as AxiosError<any>;
        console.error('[AI Chat Request Failed]', {
          name: axiosErr.name,
          message: axiosErr.message,
          httpStatus: axiosErr.response?.status,
          httpStatusText: axiosErr.response?.statusText,
          requestURL: axiosErr.config
            ? `${axiosErr.config.baseURL ?? ''}${axiosErr.config.url ?? ''}`
            : 'unknown',
          requestMethod: axiosErr.config?.method?.toUpperCase(),
          responseData: axiosErr.response?.data ?? '(no response body — network error?)',
          isAxiosError: axiosErr.isAxiosError,
        });
      }

      const axiosErr = err as AxiosError<any>;
      const httpStatus = axiosErr.response?.status;
      const backendMsg: string =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Nomalum server xatosi';

      // User-friendly message — never exposes tokens or secrets
      const uiMessage = httpStatus
        ? `Server xatosi (${httpStatus}): ${backendMsg}`
        : `Tarmoq xatosi: ${backendMsg}. Backend ishlamoqdami? (http://localhost:3000)`;

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'ASSISTANT',
          content: uiMessage,
          disclaimer: 'Medical information, not a diagnosis',
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
        content: "Suhbat tozalandi. Qanday tibbiy savolingiz bor?",
        disclaimer: "Disclaimer: Gippo AI is an informational tool and does NOT replace professional medical advice.",
      },
    ]);
    setActiveConversationId(undefined);
    setEmergencyAlert(null);
  };

  const suggestedQuestions = [
    "Bosh og'rig'i va charchoq sabablari nimada?",
    "Shamollashning dastlabki alomatlarida nima qilish kerak?",
    "Sog'lom ovqatlanish rejasi haqida ma'lumot bering",
    "Qon bosimi oshganda birinchi yordam",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Safety Warning */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-teal text-white flex items-center justify-center font-bold shadow-md">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">AI Medical Assistant</h1>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                100% BEPUL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Xavfsiz, mas'uliyatli va tibbiy disclaimeli AI maslahatchisi
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Suhbatni Tozalash
        </button>
      </div>

      {/* Emergency Banner UI if triggered */}
      {emergencyAlert && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-xl animate-bounce flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 shrink-0" />
            <div>
              <strong className="block font-bold text-sm">ZUDLIK BILAN TEZ YORDAM (103) GA QO'NG'IROQ QILING!</strong>
              <p className="text-xs text-rose-100 mt-0.5">{emergencyAlert}</p>
            </div>
          </div>
          <a
            href="tel:103"
            className="px-4 py-2 bg-white text-rose-700 font-extrabold text-xs rounded-xl shadow shrink-0 hover:bg-rose-50"
          >
            <PhoneCall className="w-4 h-4 inline mr-1" />
            103 Call
          </a>
        </div>
      )}

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden flex flex-col h-[600px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
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
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none space-y-2'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1 opacity-80">
                  {msg.sender === 'USER' ? (
                    <>
                      <span>Siz</span>
                      <User className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-teal-700">AI Medical Assistant</span>
                    </>
                  )}
                </div>

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Medical Disclaimer Banner */}
                {msg.sender === 'ASSISTANT' && msg.disclaimer && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[10px] text-amber-700 bg-amber-50/80 p-2 rounded-xl">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{msg.disclaimer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 bg-white p-3.5 rounded-2xl border border-slate-200 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>AI tahlil qilmoqda va javob tayyorlamoqda...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Prompts Pill */}
        {messages.length <= 2 && (
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-[11px] font-semibold text-slate-700 shrink-0 transition-colors"
              >
                💡 {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            placeholder="Tibbiy alomatlar yoki savolingizni yozing..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim() || chatMutation.isPending}
            className="px-5 py-3 rounded-2xl gradient-teal text-white font-bold text-xs shadow-md shadow-teal-500/20 disabled:opacity-50 hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <span>Yuborish</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
