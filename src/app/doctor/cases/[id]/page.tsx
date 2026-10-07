'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DoctorSidebar from '@/components/DoctorSidebar';
import StatusBadge from '@/components/StatusBadge';
import TriageBadge from '@/components/TriageBadge';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  ConsultationCase,
  ClinicalExtraction,
} from '@/lib/types';
import { getStoredCase, setStoredCase } from '@/lib/storage';
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  Edit3,
  Check,
  X,
  Clock,
  Gauge,
  MapPin,
  Pill,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MessageSquare,
  HeartPulse,
} from 'lucide-react';

export default function DoctorCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = (params?.id as string) || 'DR-2048';

  const [caseData, setCaseData] = useState<ConsultationCase | null>(null);
  const [extraction, setExtraction] = useState<ClinicalExtraction | null>(null);
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'case-sheet' | 'transcript'>('case-sheet');

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (res.ok) {
        const data = await res.json();
        setCaseData(data.case);
        setExtraction(data.case.extractedData);
        setDoctorNotes(data.case.doctorNotes || '');
        return;
      }
    } catch (e) {
      console.warn('API fetch failed, falling back to local store:', e);
    }

    const local = getStoredCase();
    if (local && (local.id === caseId || caseId === 'DR-2048')) {
      setCaseData(local);
      setExtraction(local.extractedData);
      setDoctorNotes(local.doctorNotes || '');
    }
  };

  const handleFieldChange = (field: keyof ClinicalExtraction, value: any) => {
    if (!extraction) return;
    setExtraction({ ...extraction, [field]: value });
  };

  const handleArrayChange = (field: 'associatedSymptoms' | 'medications' | 'allergies' | 'medicalHistory', text: string) => {
    if (!extraction) return;
    const items = text.split(',').map((s) => s.trim()).filter(Boolean);
    setExtraction({ ...extraction, [field]: items });
  };

  const handleSaveChanges = async () => {
    if (!caseData || !extraction) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedData: extraction,
          doctorNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCaseData(data.case);
        setStoredCase(data.case);
        setToast({
          id: `toast-${Date.now()}`,
          type: 'success',
          title: 'Changes Saved',
          message: 'Clinical parameters and notes updated.',
        });
        setEditingSection(null);
      }
    } catch (e) {
      console.error('Save error:', e);
      setToast({
        id: `toast-${Date.now()}`,
        type: 'error',
        title: 'Save Failed',
        message: 'Could not persist modifications.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyCase = async () => {
    if (!caseData || !extraction) return;
    setIsVerifying(true);

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          doctorName: 'Dr. Arvind Sharma, MD',
          doctorNotes,
          extractedData: extraction,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCaseData(data.case);
        setStoredCase(data.case);
        setToast({
          id: `toast-${Date.now()}`,
          type: 'success',
          title: 'Case Doctor Verified!',
          message: 'Case verified with physician digital signature and timestamp.',
        });
      }
    } catch (e) {
      console.error('Verification error:', e);
      setToast({
        id: `toast-${Date.now()}`,
        type: 'error',
        title: 'Verification Failed',
        message: 'Could not update verification status.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!caseData || !extraction) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-lg">
            <Clock className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">Loading clinical case {caseId}...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isVerified = caseData.status === 'Doctor Verified';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <DoctorSidebar />

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Top Breadcrumb */}
          <div className="flex items-center justify-between">
            <Link
              href="/doctor/cases"
              className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-sky-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Incoming Cases</span>
            </Link>

            <div className="flex items-center space-x-2">
              <TriageBadge urgency={extraction.urgencyLevel} />
              <StatusBadge status={caseData.status} />
            </div>
          </div>

          {/* Patient Case Header Banner */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-base shadow-xs">
                {caseData.patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {caseData.patient.name}
                  </h1>
                  <span className="font-mono text-xs px-3 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                    {caseData.id}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500 mt-1">
                  <span>Age: {caseData.patient.age} yrs</span>
                  <span>•</span>
                  <span>{caseData.patient.gender}</span>
                  <span>•</span>
                  <span>Language: {caseData.patient.language}</span>
                  <span>•</span>
                  <span>
                    Completeness:{' '}
                    <strong className="text-sky-700 font-bold">
                      {caseData.completeness?.percentage || 80}%
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="btn-secondary !py-2.5 !px-4 text-xs sm:text-sm font-semibold shadow-xs"
              >
                <Save className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>

              <button
                type="button"
                onClick={handleVerifyCase}
                disabled={isVerifying || isVerified}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 min-h-[44px] ${
                  isVerified
                    ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-400 cursor-default'
                    : 'btn-primary shadow-md'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{isVerified ? 'Doctor Verified' : 'Verify Case'}</span>
              </button>
            </div>
          </div>

          {/* Verification Banner */}
          {isVerified && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">✓ Doctor Verified</span> by{' '}
                  <span className="font-bold text-emerald-800">
                    {caseData.verifiedBy || 'Dr. Arvind Sharma, MD'}
                  </span>
                  {caseData.verifiedAt && (
                    <span className="text-slate-500 ml-2">
                      on {new Date(caseData.verifiedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Sign-off Active
              </span>
            </div>
          )}

          {/* Tab Selector: Case Sheet vs Full Dialogue Transcript */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('case-sheet')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'case-sheet'
                  ? 'bg-sky-100 text-sky-800 border border-sky-300 shadow-xs'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Structured Case Sheet</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transcript')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'transcript'
                  ? 'bg-sky-100 text-sky-800 border border-sky-300 shadow-xs'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <span>Conversation Transcript ({caseData.messages.length} turns)</span>
            </button>
          </div>

          {activeTab === 'case-sheet' ? (
            <div className="space-y-6">
              {/* AI CASE SUMMARY BLOCK */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>AI-Generated Pre-Consultation Summary</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
                    Physician Verification Required
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                  {caseData.aiSummary ||
                    'Patient completed pre-consultation questionnaire. Core clinical vectors extracted for physician review.'}
                </p>

                {/* Missing Information Callout */}
                {extraction.missingInformation && extraction.missingInformation.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-2 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Missing / Unreported Details: </span>
                      <span>{extraction.missingInformation.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CLINICAL DATA BLOCKS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chief Concern */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                      <HeartPulse className="w-4 h-4 text-sky-600" />
                      <span>Chief Concern</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSection(editingSection === 'chief' ? null : 'chief')
                      }
                      className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{editingSection === 'chief' ? 'Done' : 'Edit'}</span>
                    </button>
                  </div>
                  {editingSection === 'chief' ? (
                    <input
                      type="text"
                      value={extraction.chiefComplaint}
                      onChange={(e) => handleFieldChange('chiefComplaint', e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-sky-400 p-2.5 text-sm text-slate-900 focus:outline-none"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 text-base">
                      {extraction.chiefComplaint || 'Pending assessment'}
                    </p>
                  )}
                </div>

                {/* Duration & Severity */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-sky-600" />
                      <span>Duration & Severity</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSection(editingSection === 'dur_sev' ? null : 'dur_sev')
                      }
                      className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{editingSection === 'dur_sev' ? 'Done' : 'Edit'}</span>
                    </button>
                  </div>
                  {editingSection === 'dur_sev' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={extraction.duration}
                        onChange={(e) => handleFieldChange('duration', e.target.value)}
                        placeholder="Duration"
                        className="rounded-xl bg-slate-50 border border-sky-400 p-2 text-sm text-slate-900 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={extraction.severity}
                        onChange={(e) => handleFieldChange('severity', e.target.value)}
                        placeholder="Severity"
                        className="rounded-xl bg-slate-50 border border-sky-400 p-2 text-sm text-slate-900 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <p className="font-bold text-slate-900 text-base">
                      {extraction.duration || 'Unspecified duration'} •{' '}
                      <span className="text-sky-700">{extraction.severity || 'Unrated'}</span>
                    </p>
                  )}
                </div>

                {/* Location & Character */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-sky-600" />
                      <span>Anatomical Location</span>
                    </label>
                  </div>
                  <p className="font-bold text-slate-900 text-base">
                    {extraction.location || 'Not reported'}
                  </p>
                </div>

                {/* Associated Symptoms */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Associated Symptoms
                    </label>
                  </div>
                  {extraction.associatedSymptoms && extraction.associatedSymptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {extraction.associatedSymptoms.map((sym, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-sm">None mentioned</p>
                  )}
                </div>

                {/* Medications */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                      <Pill className="w-4 h-4 text-sky-600" />
                      <span>Reported Medications</span>
                    </label>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {extraction.medications?.length ? extraction.medications.join(', ') : 'None reported'}
                  </p>
                </div>

                {/* Allergies */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      <span>Known Allergies</span>
                    </label>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {extraction.allergies?.length ? extraction.allergies.join(', ') : 'No known drug allergies'}
                  </p>
                </div>
              </div>

              {/* DOCTOR NOTES BOX */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Edit3 className="w-4 h-4 text-sky-600" />
                    <span>Attending Physician Clinical Notes & Assessment</span>
                  </label>
                  <span className="text-xs text-slate-400">Appended to verified case</span>
                </div>
                <textarea
                  rows={4}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Enter physician assessment, differential diagnosis, exam findings, or treatment plan..."
                  className="w-full rounded-2xl bg-slate-50 border border-slate-300 p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all leading-relaxed"
                />
              </div>
            </div>
          ) : (
            /* CONVERSATION TRANSCRIPT TAB */
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Full Verbatim Patient Dialogue
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {caseData.messages.length} total messages
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {caseData.messages.map((m, idx) => {
                  const isAi = m.sender === 'ai';
                  return (
                    <div
                      key={idx}
                      className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isAi
                            ? 'bg-sky-50 border border-sky-200 text-slate-800'
                            : 'bg-sky-600 text-white shadow-sm'
                        }`}
                      >
                        <div className="text-[11px] font-bold mb-1 opacity-80">
                          {isAi ? 'Health Buddy (AI)' : caseData.patient.name} · {m.timestamp}
                        </div>
                        <p className="whitespace-pre-wrap m-0 font-normal">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
