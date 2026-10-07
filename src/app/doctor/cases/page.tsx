'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DoctorSidebar from '@/components/DoctorSidebar';
import CaseTable from '@/components/CaseTable';
import { ConsultationCase, DoctorStats } from '@/lib/types';
import { getStoredCase } from '@/lib/storage';
import { FolderOpen, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

function CasesListContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';

  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [stats, setStats] = useState<DoctorStats | undefined>();
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
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.warn('Failed to load cases:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <DoctorSidebar stats={stats} />

      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 mb-1">
              <Link
                href="/doctor"
                className="hover:underline flex items-center space-x-1 text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Dashboard</span>
              </Link>
              <span>/</span>
              <span>All Cases</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <FolderOpen className="w-7 h-7 text-sky-600" aria-hidden="true" />
              <span>Patient Consultation Registry</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Log of pre-consultation intake submissions. Filter by verification status or search by symptoms.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-xs px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-mono font-semibold shadow-xs">
              {cases.length} Total Registered
            </span>
          </div>
        </div>

        {/* Cases Table */}
        <CaseTable cases={cases} initialFilter={filterParam} />
      </main>
    </div>
  );
}

export default function DoctorCasesListPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="flex items-center space-x-2 text-slate-500 text-sm">
              <Clock className="w-5 h-5 text-sky-600 animate-spin" />
              <span>Loading case registry...</span>
            </div>
          </div>
        }
      >
        <CasesListContent />
      </Suspense>
      <Footer />
    </div>
  );
}
