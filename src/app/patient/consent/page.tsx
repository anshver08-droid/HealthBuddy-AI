'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PatientHeader from '@/components/PatientHeader';
import { getStoredPatient, setStoredPatient } from '@/lib/storage';
import { PatientProfile } from '@/lib/types';
import {
  ShieldCheck,
  AlertCircle,
  Stethoscope,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function ConsentPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [hasConsented, setHasConsented] = useState<boolean>(false);

  useEffect(() => {
    const stored = getStoredPatient();
    setPatient(stored);
    if (stored?.consentGiven) {
      setHasConsented(true);
    }
  }, []);

  const handleStartConsultation = () => {
    if (!hasConsented || !patient) return;

    const updated: PatientProfile = {
      ...patient,
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
    };
    setStoredPatient(updated);
    router.push('/patient/consultation');
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <PatientHeader patient={patient} currentStep={2} />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-9 shadow-lg">

            {/* Header Icon */}
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 mb-6 shadow-sm">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Before we begin your visit prep
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Step 2 of 5 · Understanding how Health Buddy works and providing your consent
            </p>

            {/* Core Explanation Box */}
            <div className="mt-6 p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900 text-base">
                Health Buddy asks you simple questions about how you feel. Then it gives your doctor a clear summary, so your visit starts with what matters.
              </p>
              <div className="pt-3 border-t border-sky-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>
                    <strong className="text-slate-900">Non-Diagnostic System:</strong> Health Buddy doesn&apos;t diagnose or prescribe. Your doctor makes every medical decision.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>
                    <strong className="text-slate-900">Physician Verification:</strong> Your doctor reviews, edits, and verifies every detail of the summary before taking clinical action.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
                  <span>
                    <strong className="font-bold">Emergency Notice:</strong> If you are experiencing severe chest pain, shortness of breath, or life-threatening symptoms, call <strong>112 / 911</strong> or go to an emergency room immediately.
                  </span>
                </div>
              </div>
            </div>

            {/* Highlighted Notice */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-sm text-slate-700">
              <Stethoscope className="w-5 h-5 text-sky-600 shrink-0" aria-hidden="true" />
              <p className="font-semibold text-slate-800">
                Health Buddy doesn&apos;t diagnose or prescribe. Your doctor is always in charge.
              </p>
            </div>

            {/* Mandatory Checkbox */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <label
                htmlFor="consent-checkbox"
                className="flex items-start gap-3 cursor-pointer select-none p-3 -m-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-slate-800 leading-normal">
                  I understand and agree to share my health details with my doctor through Health Buddy.
                </span>
              </label>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={handleStartConsultation}
              disabled={!hasConsented}
              className="mt-6 btn-primary w-full justify-center !py-3.5 text-base font-bold shadow-md"
            >
              <span>Begin AI Intake</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
