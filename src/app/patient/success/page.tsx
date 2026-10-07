'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PatientHeader from '@/components/PatientHeader';
import { ConsultationCase, PatientProfile } from '@/lib/types';
import { getStoredCase, getStoredPatient, DEFAULT_DEMO_PATIENT } from '@/lib/storage';
import {
  CheckCircle2,
  Stethoscope,
  FileText,
  AlertTriangle,
  ArrowRight,
  Copy,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function SuccessPage() {
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_DEMO_PATIENT);
  const [activeCase, setActiveCase] = useState<ConsultationCase | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const p = getStoredPatient();
    setPatient(p);
    const c = getStoredCase();
    setActiveCase(c);

    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#059669'],
      });
    } catch (e) {
      console.warn('Confetti notice:', e);
    }
  }, []);

  const caseId = activeCase?.id || 'DR-2048';
  const summaryText =
    activeCase?.aiSummary ||
    `Patient ${patient.name} (${patient.age} y/o) presented for pre-consultation intake. Chief concern: ${
      activeCase?.extractedData.chiefComplaint || 'reported symptoms'
    } (duration: ${activeCase?.extractedData.duration || 'recent onset'}, severity: ${
      activeCase?.extractedData.severity || 'moderate'
    }). Summary prepared for physician review.`;

  const copyId = () => {
    navigator.clipboard.writeText(caseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <PatientHeader patient={patient} currentStep={5} consultationId={caseId} />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg text-center w-full">
          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Case Successfully Prepared
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            Your pre-consultation intake is saved and queued for your doctor&apos;s review.
          </p>

          {/* Consultation ID Pill */}
          <div className="mt-6 inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-sky-50 border border-sky-200 shadow-xs">
            <span className="text-xs text-slate-600 font-semibold">Consultation ID:</span>
            <span className="font-mono font-bold text-sky-700 text-sm">{caseId}</span>
            <button
              type="button"
              onClick={copyId}
              className="ml-2 text-slate-500 hover:text-sky-700 transition-colors p-1"
              title="Copy consultation ID"
              aria-label="Copy consultation ID"
            >
              <Copy className="w-4 h-4" aria-hidden="true" />
            </button>
            {copied && <span className="text-xs text-emerald-600 font-bold">Copied!</span>}
          </div>

          {/* AI Case Summary Card */}
          <div className="mt-8 text-left p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700">
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>Pre-Consultation Summary</span>
              </div>
              <span className="text-xs font-mono text-slate-500 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Just compiled</span>
              </span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {summaryText}
            </p>

            {/* Verification Status Badges */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>Pre-consultation draft</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-300">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                <span>Requires physician verification</span>
              </span>
            </div>
          </div>

          {/* What Happens Next Card */}
          <div className="mt-6 p-5 rounded-2xl bg-sky-50/70 border border-sky-200 text-left text-xs sm:text-sm text-slate-700">
            <h4 className="font-bold text-slate-900 mb-1">What happens next?</h4>
            <p className="leading-relaxed">
              When you meet your doctor, they will open this summary, review your answers with you, conduct your physical examination, and determine your diagnosis and treatment plan.
            </p>
          </div>

          {/* Doctor Review / Testing Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/doctor/cases/${caseId}`}
              className="btn-primary w-full sm:w-auto !py-3.5 !px-6 shadow-md"
            >
              <Stethoscope className="w-4 h-4 text-white" aria-hidden="true" />
              <span>Open Doctor Console (Review Case)</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <Link
              href="/"
              className="btn-secondary w-full sm:w-auto !py-3.5 !px-6"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
