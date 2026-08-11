'use client';

import React, { useState } from 'react';
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
  ShieldAlert,
  Calendar,
  CreditCard,
  Building2,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) return '/admin/dashboard';
    if (user.role === Role.DOCTOR) return '/doctor/dashboard';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                  Gippo<span className="text-teal-600">.uz</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  Health-Tech Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/doctors"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.startsWith('/doctors')
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Shifokorlar
              </Link>
              <Link
                href="/specialties"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/specialties'
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Mutaxassisliklar
              </Link>
              <Link
                href="/ai"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === '/ai'
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Bot className="w-4 h-4 text-teal-600 animate-pulse" />
                <span>AI Tibbiy Assistent</span>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Bepul
                </span>
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/about'
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Loyiha Haqida
              </Link>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-[10px] text-teal-600 font-semibold uppercase">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                    onMouseLeave={() => setIsProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Kirilgan hisob:</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Shaxsiy Kabinet</span>
                    </Link>

                    {user.role === Role.PATIENT && (
                      <>
                        <Link
                          href="/appointments"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Mening Qabullarim</span>
                        </Link>
                        <Link
                          href="/payments"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>To'lovlar tarixi</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Chiqish</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white gradient-teal rounded-xl shadow-md shadow-teal-500/20 hover:opacity-95 transition-opacity"
                >
                  Ro'yxatdan o'tish
                </Link>
                <Link
                  href="/doctor/register"
                  className="px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Shifokor sifatida kirish
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col gap-1">
            <Link
              href="/doctors"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-teal-50"
            >
              Shifokorlar katalogi
            </Link>
            <Link
              href="/specialties"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-teal-50"
            >
              Tibbiy Mutaxassisliklar
            </Link>
            <Link
              href="/ai"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-teal-700 bg-teal-50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-teal-600" />
                AI Tibbiy Assistent
              </span>
              <span className="text-[10px] font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full">
                BEPUL
              </span>
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-teal-50"
            >
              Loyiha haqida
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white gradient-teal rounded-xl"
                >
                  Kabinetga o'tish ({user.role})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white gradient-teal rounded-xl shadow-md"
                >
                  Bemor sifatida ro'yxatdan o'tish
                </Link>
                <Link
                  href="/doctor/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl"
                >
                  Shifokorlar uchun portal
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
