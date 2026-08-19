'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Role } from '@/types';
import {
  Stethoscope,
  Bot,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Calendar,
  CreditCard,
  Building2,
  ChevronDown,
  Sparkles,
  Info,
  Users,
  Grid,
} from 'lucide-react';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { ThemeLanguageSwitcher } from '@/components/layout/ThemeLanguageSwitcher';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useLanguageStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key press to close menu or dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    router.push('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) return '/admin/dashboard';
    if (user.role === Role.DOCTOR) return '/doctor/dashboard';
    return '/dashboard';
  };

  const isNavActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl p-1">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5 leading-none">
                Gippo<span className="text-teal-600 dark:text-teal-400">.uz</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mt-1">
                Health-Tech
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Navigation (lg:flex, hidden on smaller screens) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/doctors"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isNavActive('/doctors')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900'
              }`}
            >
              {t.nav.doctors}
            </Link>

            <Link
              href="/specialties"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isNavActive('/specialties')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900'
              }`}
            >
              {t.nav.specialties}
            </Link>

            <Link
              href="/ai"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                isNavActive('/ai')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span>{t.nav.ai}</span>
              <span className="bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {t.hero.freeBadge}
              </span>
            </Link>

            <Link
              href="/about"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isNavActive('/about')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900'
              }`}
            >
              {t.nav.howItWorks}
            </Link>
          </nav>

          {/* Desktop Right Action Area */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeLanguageSwitcher />

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  aria-label="User menu"
                  aria-expanded={isProfileDropdownOpen}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm focus:ring-2 focus:ring-teal-500"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-up"
                    onMouseLeave={() => setIsProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">{t.nav.signedInAs}</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>{t.nav.dashboard}</span>
                    </Link>

                    {user.role === Role.PATIENT && (
                      <>
                        <Link
                          href="/appointments"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>{t.nav.myAppointments}</span>
                        </Link>
                        <Link
                          href="/payments"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>{t.nav.paymentHistory}</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white gradient-teal rounded-xl shadow-md shadow-teal-500/20 hover:opacity-95 transition-opacity"
                >
                  {t.nav.register}
                </Link>
                <Link
                  href="/doctor/register"
                  className="px-3 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/80 transition-colors flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {t.nav.forDoctors}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Hamburger Button (Visible on < 1024px) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-teal-500"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-teal-600 dark:text-teal-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-up"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content Panel */}
          <div
            id="mobile-navigation-drawer"
            className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col justify-between p-6 overflow-y-auto transition-transform animate-slide-right"
          >
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center text-white">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Gippo<span className="text-teal-600 dark:text-teal-400">.uz</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Controls (Language & Theme Switcher) */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2.5">
                  {t.nav.settings}
                </p>
                <ThemeLanguageSwitcher />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2.5">
                  Bo'limlar
                </p>
                
                <Link
                  href="/doctors"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-semibold transition-colors ${
                    isNavActive('/doctors')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>{t.nav.doctors}</span>
                </Link>

                <Link
                  href="/specialties"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-semibold transition-colors ${
                    isNavActive('/specialties')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Grid className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>{t.nav.specialties}</span>
                </Link>

                <Link
                  href="/ai"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-semibold transition-colors ${
                    isNavActive('/ai')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400 animate-pulse" />
                    <span>{t.nav.ai}</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full uppercase">
                    {t.hero.freeBadge}
                  </span>
                </Link>

                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-semibold transition-colors ${
                    isNavActive('/about')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>{t.nav.howItWorks}</span>
                </Link>
              </nav>
            </div>

            {/* Bottom Auth Buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={getDashboardLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-sm font-bold text-white gradient-teal rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>{t.nav.dashboard}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 text-center text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.nav.logout}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-sm font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 transition-colors block"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-sm font-bold text-white gradient-teal rounded-xl shadow-md shadow-teal-500/20 block"
                  >
                    {t.nav.patientRegister}
                  </Link>
                  <Link
                    href="/doctor/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl block flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{t.nav.doctorPortalLink}</span>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
