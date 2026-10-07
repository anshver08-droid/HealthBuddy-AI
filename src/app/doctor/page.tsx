'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DoctorSidebar from '@/components/DoctorSidebar';
import CaseTable from '@/components/CaseTable';
import { ConsultationCase, DoctorStats } from '@/lib/types';
import { getStoredCase } from '@/lib/storage';
import {
  Activity,
  FolderOpen,
  CheckCircle2,
  Clock,
  Gauge,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [stats, setStats] = useState<DoctorStats>({
    newCasesCount: 4,
    pendingReviewCount: 2,
    reviewedTodayCount: 2,
    averageCompleteness: 86,
    urgentCasesCount: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        let loadedCases: ConsultationCase[] = data.cases || [];

        const stored = getStoredCase();
        if (stored && !loadedCases.some((c) => c.id === stored.id)) {
          loadedCases = [stored, ...loadedCases];
        }

        setCases(loadedCases);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch cases, using fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Doctor Sidebar */}
        <DoctorSidebar stats={stats} />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
                <Stethoscope className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <span>Physician Triage & Review Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Doctor Case Dashboard
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Pre-consultation intake summaries organized by Health Buddy. Ready for physician review, editing, and clinical verification.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/doctor/cases"
                className="btn-primary !py-2.5 !px-5 text-sm font-bold shadow-md"
              >
                <FolderOpen className="w-4 h-4" aria-hidden="true" />
                <span>View All Cases</span>
              </Link>
            </div>
          </div>

          {/* Key Stat Cards in Light Blue Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Cases */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Cases</span>
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                  <Activity className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {cases.length}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                <span className="text-sky-600 font-bold">+1</span>
                <span>in active session</span>
              </div>
            </div>

            {/* Pending Review */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">
                {cases.filter((c) => c.status !== 'Doctor Verified').length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Awaiting physician review</div>
            </div>

            {/* Doctor Verified */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Verified Today</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                {cases.filter((c) => c.status === 'Doctor Verified').length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Verified with physician notes</div>
            </div>

            {/* Avg Completeness */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Completeness</span>
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                  <Gauge className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 font-mono">
                {stats.averageCompleteness}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Structured clinical data score</div>
            </div>
          </div>

          {/* Clinical Intake Analytics Section */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-sky-600" aria-hidden="true" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Clinical Intake Analytics & Triage Metrics
                </h3>
              </div>
              <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                Live Prototype Analytics
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Avg Intake Duration</div>
                <div className="text-base font-bold text-slate-900 mt-1">2.4 min</div>
                <div className="text-xs text-emerald-700 font-semibold mt-0.5">-6.2 min vs manual</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Case Completeness</div>
                <div className="text-base font-bold text-sky-700 mt-1">84.2%</div>
                <div className="text-xs text-slate-500 mt-0.5">7 clinical vectors</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Cases Processed</div>
                <div className="text-base font-bold text-slate-900 mt-1">42</div>
                <div className="text-xs text-slate-500 mt-0.5">Demonstrated</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Verification Rate</div>
                <div className="text-base font-bold text-emerald-700 mt-1">100%</div>
                <div className="text-xs text-slate-500 mt-0.5">Doctor verified</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-500 font-medium">Missing Info Rate</div>
                <div className="text-base font-bold text-amber-700 mt-1">11.8%</div>
                <div className="text-xs text-slate-500 mt-0.5">Flagged for doctor</div>
              </div>
            </div>
          </div>

          {/* Incoming Cases Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Patient Submissions</h2>
                <p className="text-xs text-slate-500">
                  Select a case to inspect structured data, raw dialogue, and approve.
                </p>
              </div>

              <Link
                href="/patient"
                className="text-xs sm:text-sm text-sky-600 hover:text-sky-800 flex items-center space-x-1 font-bold"
              >
                <span>+ Simulate new intake</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            <CaseTable cases={cases} initialFilter="all" />
          </div>

          {/* Doctor Final Authority Reminder */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-slate-900">Physician Clinical Authority:</strong> Health Buddy assists with information gathering and summarization. Clinical decisions remain solely with the attending doctor.
              </span>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
