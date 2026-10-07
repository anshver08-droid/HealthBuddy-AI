'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { setUserRole, setStoredPatient, DEFAULT_DEMO_PATIENT } from '@/lib/storage';
import {
  UserCheck,
  Stethoscope,
  HeartPulse,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlePatientDemoLogin = () => {
    setUserRole('patient');
    setStoredPatient(DEFAULT_DEMO_PATIENT);
    router.push('/patient');
  };

  const handleDoctorDemoLogin = () => {
    setUserRole('doctor');
    router.push('/doctor');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'doctor') {
      handleDoctorDemoLogin();
    } else {
      handlePatientDemoLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main id="main-content" className="flex-1 py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 mx-auto mb-4 shadow-xs">
                <HeartPulse className="w-6 h-6" aria-hidden="true" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Health Buddy Access
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Select your role to explore the interactive intake prototype
              </p>
            </div>

            {/* Quick Demo Access Buttons */}
            <div className="space-y-3.5 mb-8">
              <button
                type="button"
                onClick={handlePatientDemoLogin}
                className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 text-left transition-all flex items-center justify-between group min-h-[48px] shadow-xs"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                    <UserCheck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                      Demo as Patient (Akash Singh)
                    </div>
                    <div className="text-xs text-slate-500">
                      Experience intake, voice mic & adaptive chat
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleDoctorDemoLogin}
                className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 text-left transition-all flex items-center justify-between group min-h-[48px] shadow-xs"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                    <Stethoscope className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                      Demo as Doctor (Dr. Arvind Sharma)
                    </div>
                    <div className="text-xs text-slate-500">
                      Triage cases, review & verify clinical notes
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold">or login credentials</span>
              </div>
            </div>

            {/* Custom Login Form */}
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 min-h-[44px] transition-all"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 min-h-[44px] transition-all"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center !py-3 text-sm font-bold shadow-md"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
