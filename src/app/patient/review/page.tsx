'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PatientHeader from '@/components/PatientHeader';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  ConsultationCase,
  PatientProfile,
  ClinicalExtraction,
} from '@/lib/types';
import {
  getStoredPatient,
  getStoredCase,
  setStoredCase,
  getStoredSettings,
  DEFAULT_DEMO_PATIENT,
} from '@/lib/storage';
import { createInitialExtraction, calculateCompleteness } from '@/lib/ai/adaptiveEngine';
import {
  ClipboardCheck,
  Edit3,
  Clock,
  Gauge,
  MapPin,
  Pill,
  ShieldCheck,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_DEMO_PATIENT);
  const [activeCase, setActiveCase] = useState<ConsultationCase | null>(null);
  const [extraction, setExtraction] = useState<ClinicalExtraction>(createInitialExtraction());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const loadedPatient = getStoredPatient();
    setPatient(loadedPatient);

    const loadedCase = getStoredCase();
    if (loadedCase) {
      setActiveCase(loadedCase);
      setExtraction(loadedCase.extractedData);
    }
  }, []);

  const handleFieldChange = (field: keyof ClinicalExtraction, value: any) => {
    const updated = { ...extraction, [field]: value };
    setExtraction(updated);
  };

  const handleArrayFieldChange = (
    field: 'associatedSymptoms' | 'medications' | 'allergies' | 'medicalHistory',
    text: string
  ) => {
    const items = text.split(',').map((s) => s.trim()).filter(Boolean);
    const updated = { ...extraction, [field]: items };
    setExtraction(updated);
  };

  const handleSubmitForDoctorReview = async () => {
    setIsSubmitting(true);

    try {
      const currentSettings = getStoredSettings();
      const summaryRes = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extraction,
          patient,
          demoMode: currentSettings.demoMode,
        }),
      });

      let aiSummary = 'Patient presented with symptoms for pre-consultation intake.';
      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        aiSummary = sumData.summary;
      }

      const completeness = calculateCompleteness(extraction);
      const caseId = activeCase?.id || `DR-${Math.floor(1000 + Math.random() * 9000)}`;

      const finalCasePayload: ConsultationCase = {
        id: caseId,
        patient,
        createdAt: activeCase?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Pending',
        messages: activeCase?.messages || [],
        extractedData: extraction,
        completeness,
        aiSummary,
      };

      setStoredCase(finalCasePayload);

      try {
        await fetch('/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalCasePayload),
        });
      } catch (err) {
        console.warn('API cases persist error:', err);
      }

      router.push('/patient/success');
    } catch (e) {
      console.warn('Review submission error:', e);
      setToast({
        id: `toast-${Date.now()}`,
        type: 'warning',
        title: 'Submission Notice',
        message: 'Saved locally as fallback.',
      });
      router.push('/patient/success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <PatientHeader
        patient={patient}
        currentStep={4}
        consultationId={activeCase?.id || 'DR-2048'}
      />

      <main id="main-content" className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-lg">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold mb-2">
                <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Verification Stage</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Review Your Information
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Please check the details below. You can edit any field before sending it to your doctor.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center space-x-3 shrink-0">
              <div>
                <div className="text-xs text-slate-500 font-medium">Intake Completeness</div>
                <div className="text-lg font-bold text-sky-600 font-mono">
                  {calculateCompleteness(extraction).percentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Extracted Fields */}
          <div className="mt-8 space-y-6">

            {/* Chief Concern */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                  <HeartPulse className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  <span>Main Concern / Reason for Visit</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField(editingField === 'chiefComplaint' ? null : 'chiefComplaint')
                  }
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center space-x-1 px-3 py-1 rounded-full hover:bg-sky-50 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{editingField === 'chiefComplaint' ? 'Done' : 'Edit'}</span>
                </button>
              </div>

              {editingField === 'chiefComplaint' ? (
                <input
                  type="text"
                  value={extraction.chiefComplaint}
                  onChange={(e) => handleFieldChange('chiefComplaint', e.target.value)}
                  className="w-full rounded-xl bg-white border border-sky-500 p-2.5 text-sm text-slate-900 focus:outline-none min-h-[44px]"
                />
              ) : (
                <p className="text-base font-bold text-slate-900">
                  {extraction.chiefComplaint || 'Not provided'}
                </p>
              )}
            </div>

            {/* Duration, Severity & Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Duration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                    <span>Duration</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingField(editingField === 'duration' ? null : 'duration')
                    }
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 px-2 py-1 rounded-full hover:bg-sky-50 transition-colors"
                  >
                    {editingField === 'duration' ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingField === 'duration' ? (
                  <input
                    type="text"
                    value={extraction.duration}
                    onChange={(e) => handleFieldChange('duration', e.target.value)}
                    className="w-full rounded-xl bg-white border border-sky-500 p-2 text-sm text-slate-900 focus:outline-none min-h-[44px]"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {extraction.duration || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Severity */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                    <Gauge className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                    <span>Severity</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingField(editingField === 'severity' ? null : 'severity')
                    }
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 px-2 py-1 rounded-full hover:bg-sky-50 transition-colors"
                  >
                    {editingField === 'severity' ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingField === 'severity' ? (
                  <input
                    type="text"
                    value={extraction.severity}
                    onChange={(e) => handleFieldChange('severity', e.target.value)}
                    className="w-full rounded-xl bg-white border border-sky-500 p-2 text-sm text-slate-900 focus:outline-none min-h-[44px]"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {extraction.severity || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                    <span>Location</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingField(editingField === 'location' ? null : 'location')
                    }
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 px-2 py-1 rounded-full hover:bg-sky-50 transition-colors"
                  >
                    {editingField === 'location' ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingField === 'location' ? (
                  <input
                    type="text"
                    value={extraction.location}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    className="w-full rounded-xl bg-white border border-sky-500 p-2 text-sm text-slate-900 focus:outline-none min-h-[44px]"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {extraction.location || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Associated Symptoms */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Associated Symptoms
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField(
                      editingField === 'associatedSymptoms' ? null : 'associatedSymptoms'
                    )
                  }
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 px-3 py-1 rounded-full hover:bg-sky-50 transition-colors"
                >
                  {editingField === 'associatedSymptoms' ? 'Done' : 'Edit'}
                </button>
              </div>
              {editingField === 'associatedSymptoms' ? (
                <input
                  type="text"
                  value={extraction.associatedSymptoms.join(', ')}
                  onChange={(e) => handleArrayFieldChange('associatedSymptoms', e.target.value)}
                  className="w-full rounded-xl bg-white border border-sky-500 p-2 text-sm text-slate-900 focus:outline-none min-h-[44px]"
                />
              ) : (
                <p className="text-sm text-slate-800 font-medium">
                  {extraction.associatedSymptoms.length > 0
                    ? extraction.associatedSymptoms.join(', ')
                    : 'None mentioned'}
                </p>
              )}
            </div>

            {/* Medications & Allergies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                    <Pill className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                    <span>Current Medications</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingField(editingField === 'medications' ? null : 'medications')
                    }
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 px-2 py-1 rounded-full hover:bg-sky-50 transition-colors"
                  >
                    {editingField === 'medications' ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingField === 'medications' ? (
                  <input
                    type="text"
                    value={extraction.medications.join(', ')}
                    onChange={(e) => handleArrayFieldChange('medications', e.target.value)}
                    className="w-full rounded-xl bg-white border border-sky-500 p-2 text-sm text-slate-900 focus:outline-none min-h-[44px]"
                  />
                ) : (
                  <p className="text-sm text-slate-800 font-medium">
                    {extraction.medications.length > 0
                      ? extraction.medications.join(', ')
                      : 'None reported'}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                    <span>Known Allergies</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingField(editingField === 'allergies' ? null : 'allergies')
                    }
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 px-2 py-1 rounded-full hover:bg-sky-50 transition-colors"
                  >
                    {editingField === 'allergies' ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingField === 'allergies' ? (
                  <input
                    type="text"
                    value={extraction.allergies.join(', ')}
                    onChange={(e) => handleArrayFieldChange('allergies', e.target.value)}
                    className="w-full rounded-xl bg-white border border-sky-500 p-2 text-sm text-slate-900 focus:outline-none min-h-[44px]"
                  />
                ) : (
                  <p className="text-sm text-slate-800 font-medium">
                    {extraction.allergies.length > 0
                      ? extraction.allergies.join(', ')
                      : 'No known allergies reported'}
                  </p>
                )}
              </div>
            </div>

            {/* Doctor Verification Notice */}
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start space-x-3 text-sm text-slate-700">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold text-slate-900">
                  Health Buddy doesn&apos;t diagnose or prescribe. Your doctor is always in charge.
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Once submitted, this summary will be routed directly to your physician&apos;s console for clinical verification.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmitForDoctorReview}
              disabled={isSubmitting}
              className="btn-primary w-full justify-center !py-4 text-base font-bold shadow-lg"
            >
              {isSubmitting ? (
                <span>Preparing summary & routing to doctor...</span>
              ) : (
                <>
                  <span>Submit for Doctor Review</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
