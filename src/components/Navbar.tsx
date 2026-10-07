'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HeartPulse,
  UserCheck,
  Stethoscope,
  ArrowRight,
  AlertCircle,
  PhoneCall,
  Menu,
  X,
  Home,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { getUserRole, setUserRole } from '@/lib/storage';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleRoleToggle = (newRole: 'patient' | 'doctor') => {
    setUserRole(newRole);
    setRole(newRole);
    setMobileOpen(false);
    if (newRole === 'doctor') router.push('/doctor');
    else router.push('/patient');
  };

  const isDoctorRoute = pathname?.startsWith('/doctor');
  const isPatientRoute = pathname?.startsWith('/patient');

  const NAV_LINKS = [
    { href: '/', label: 'Overview', icon: Home, active: pathname === '/' },
    { href: '/patient', label: 'For Patients', icon: UserCheck, active: isPatientRoute },
    { href: '/doctor', label: 'For Clinicians', icon: Stethoscope, active: isDoctorRoute },
    { href: '/settings', label: 'Settings', icon: Settings, active: pathname === '/settings' },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-200"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: scrolled ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
        boxShadow: scrolled ? '0 4px 20px -2px rgba(2, 132, 199, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* Emergency Help Top Bar */}
      <div className="emergency-bar" role="status">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" aria-hidden="true" />
            <span className="font-medium text-xs sm:text-sm">
              In an emergency, call <strong className="font-bold text-red-700">112 / 911</strong> or visit the nearest ER immediately.
            </span>
          </div>
          <a
            href="tel:112"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 underline underline-offset-2"
          >
            <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
            Emergency Services
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[66px]">

          {/* Included Health style Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group rounded-xl p-1 -ml-1 focus-visible:outline-none"
            aria-label="Health Buddy Home"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{
                backgroundColor: '#e0f2fe',
                border: '1.5px solid #bae6fd',
              }}
            >
              <HeartPulse
                className="w-5 h-5 text-sky-600"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Health Buddy
              </span>
              <span className="text-[11px] font-medium text-sky-600">
                Clinical Pre-Consultation
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            {NAV_LINKS.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 rounded-full transition-all duration-150"
                style={{
                  color: active ? '#0369a1' : '#475569',
                  backgroundColor: active ? '#e0f2fe' : 'transparent',
                  fontWeight: active ? 600 : 500,
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Action: Pill Role Switcher & Primary CTA */}
          <div className="flex items-center gap-3">
            {/* Role switch toggle */}
            <div
              role="radiogroup"
              aria-label="Switch active view"
              className="hidden sm:flex items-center p-1 gap-1 rounded-full border"
              style={{
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
              }}
            >
              <button
                type="button"
                role="radio"
                aria-checked={role === 'patient' && !isDoctorRoute}
                onClick={() => handleRoleToggle('patient')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                style={{
                  backgroundColor: role === 'patient' && !isDoctorRoute ? '#0284c7' : 'transparent',
                  color: role === 'patient' && !isDoctorRoute ? '#ffffff' : '#64748b',
                  boxShadow: role === 'patient' && !isDoctorRoute ? '0 2px 8px rgba(2,132,199,0.25)' : 'none',
                }}
              >
                <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Patient</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={role === 'doctor' || isDoctorRoute}
                onClick={() => handleRoleToggle('doctor')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                style={{
                  backgroundColor: role === 'doctor' || isDoctorRoute ? '#0284c7' : 'transparent',
                  color: role === 'doctor' || isDoctorRoute ? '#ffffff' : '#64748b',
                  boxShadow: role === 'doctor' || isDoctorRoute ? '0 2px 8px rgba(2,132,199,0.25)' : 'none',
                }}
              >
                <Stethoscope className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Doctor</span>
              </button>
            </div>

            {/* Contextual Light Blue Primary Button */}
            {isDoctorRoute ? (
              <Link
                href="/doctor/cases"
                className="hidden sm:inline-flex btn-primary text-sm !py-2 !px-4"
              >
                <span>Doctor Cases</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            ) : pathname !== '/' ? (
              <Link
                href="/patient"
                className="hidden sm:inline-flex btn-primary text-sm !py-2 !px-4"
              >
                <span>Start Visit Prep</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                href="/patient"
                className="hidden sm:inline-flex btn-primary text-sm !py-2 !px-5"
              >
                <span>Start Intake</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-4/5 max-w-sm h-full bg-white p-6 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900">Health Buddy</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Links */}
              <nav className="space-y-2 mb-6">
                {NAV_LINKS.map(({ href, label, icon: Icon, active }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors"
                    style={{
                      backgroundColor: active ? '#e0f2fe' : 'transparent',
                      color: active ? '#0369a1' : '#334155',
                    }}
                  >
                    <Icon className="w-5 h-5 text-sky-600" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile Role Switcher */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-2">
                  Active View Mode
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('patient')}
                    className="py-2 px-3 rounded-lg text-xs font-bold text-center"
                    style={{
                      backgroundColor: role === 'patient' ? '#0284c7' : '#ffffff',
                      color: role === 'patient' ? '#ffffff' : '#334155',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('doctor')}
                    className="py-2 px-3 rounded-lg text-xs font-bold text-center"
                    style={{
                      backgroundColor: role === 'doctor' ? '#0284c7' : '#ffffff',
                      color: role === 'doctor' ? '#ffffff' : '#334155',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    Doctor
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="space-y-3">
              <Link href="/patient" className="btn-primary w-full justify-center">
                Start Visit Prep
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Non-diagnostic · Doctor verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
