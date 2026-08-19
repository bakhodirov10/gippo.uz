'use client';

import React, { useState } from 'react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguageStore();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">{t.contact.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">{t.contact.addressLabel}</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.contact.addressValue}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Email</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">support@gippo.uz</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">{t.contact.phoneLabel}</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">+998 (71) 200-00-00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.contact.thankYou}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.contact.sentSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">{t.auth.firstName}</label>
                  <input
                    type="text"
                    required
                    placeholder="Ismingiz"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">{t.auth.email}</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">{t.contact.messageLabel}</label>
                <textarea
                  rows={4}
                  required
                  placeholder={t.contact.messagePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-white gradient-teal shadow-lg shadow-teal-500/25 hover:opacity-95 text-xs flex items-center gap-2"
              >
                <span>{t.contact.sendBtn}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
