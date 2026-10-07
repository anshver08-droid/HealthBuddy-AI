import React from 'react';
import { ClinicalExtraction, CaseCompleteness } from '@/lib/types';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Gauge,
  MapPin,
  Pill,
  ShieldAlert,
  HeartPulse,
  ArrowRight,
} from 'lucide-react';
import TriageBadge from './TriageBadge';

interface CaseInformationPanelProps {
  extraction: ClinicalExtraction;
  completeness: CaseCompleteness;
  onProceedToReview?: () => void;
}

export default function CaseInformationPanel({
  extraction,
  completeness,
  onProceedToReview,
}: CaseInformationPanelProps) {
  const percentage = completeness?.percentage || 0;

  return (
    <aside aria-label="Live Case Sheet" className="w-full h-full flex flex-col bg-white border-l border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-sky-50/60 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
            <FileText className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Live Case Sheet</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-sky-700 border border-sky-200 font-semibold shadow-xs">
                Auto-updating
              </span>
            </h3>
            <p className="text-xs text-slate-500">Live clinical extraction</p>
          </div>
        </div>

        <TriageBadge urgency={extraction.urgencyLevel} size="sm" />
      </div>

      {/* Completeness Meter */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 shrink-0">
        <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
          <span className="font-bold text-slate-700">Information Completeness</span>
          <span className="font-extrabold text-sky-600 font-mono text-sm">{percentage}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Case information completeness"
          className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              percentage >= 80
                ? 'bg-emerald-500'
                : percentage >= 50
                ? 'bg-sky-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${Math.max(5, percentage)}%` }}
          />
        </div>

        {/* Checklist Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {completeness?.checklist?.map((item) => (
            <span
              key={item.key}
              className={`text-xs px-2.5 py-1 rounded-full flex items-center space-x-1.5 font-medium ${
                item.completed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold'
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
              ) : (
                <span className="text-slate-400 shrink-0 text-xs" aria-hidden="true">•</span>
              )}
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Urgency Red-Flag Alert Banner */}
      {extraction.urgencyLevel === 'urgent' && (
        <div className="m-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs shrink-0 shadow-sm">
          <div className="flex items-center space-x-1.5 font-bold text-red-700 mb-1">
            <ShieldAlert className="w-4 h-4 text-red-600" aria-hidden="true" />
            <span>Clinical Triage Notice</span>
          </div>
          <p className="leading-relaxed">
            {extraction.urgencyRationale ||
              'Potentially urgent symptoms detected. Prompt physician review recommended.'}
          </p>
        </div>
      )}

      {/* Extracted Fields Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs sm:text-sm">
        {/* Chief Concern */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold mb-1 text-xs">
            <HeartPulse className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <span>Chief Health Concern</span>
          </div>
          <p className="font-bold text-slate-900 text-sm">
            {extraction.chiefComplaint || (
              <span className="text-slate-400 font-normal italic">Waiting for your description...</span>
            )}
          </p>
        </div>

        {/* 2-Column: Duration & Severity */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-1 text-slate-500 font-medium mb-1 text-xs">
              <Clock className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
              <span>Duration</span>
            </div>
            <p className="font-semibold text-slate-800">
              {extraction.duration || <span className="text-slate-400 italic font-normal">Pending</span>}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-1 text-slate-500 font-medium mb-1 text-xs">
              <Gauge className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
              <span>Severity</span>
            </div>
            <p className="font-semibold text-slate-800">
              {extraction.severity || <span className="text-slate-400 italic font-normal">Pending</span>}
            </p>
          </div>
        </div>

        {/* Location & Quality */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-slate-500 font-medium mb-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
            <span>Location / Character</span>
          </div>
          <p className="font-semibold text-slate-800">
            {extraction.location || (
              <span className="text-slate-400 italic font-normal">Pending details</span>
            )}
          </p>
        </div>

        {/* Associated Symptoms */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-medium mb-1.5 text-xs">
            Associated Symptoms
          </div>
          {extraction.associatedSymptoms && extraction.associatedSymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {extraction.associatedSymptoms.map((sym, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold"
                >
                  {sym}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-400 italic text-xs">None mentioned yet</span>
          )}
        </div>

        {/* Medications & Allergies */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-1 text-slate-500 font-medium mb-1 text-xs">
              <Pill className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
              <span>Medications</span>
            </div>
            {extraction.medications && extraction.medications.length > 0 ? (
              <p className="text-slate-800 font-medium leading-snug">
                {extraction.medications.join(', ')}
              </p>
            ) : (
              <span className="text-slate-400 italic text-xs font-normal">None reported</span>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-1 text-slate-500 font-medium mb-1 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>Allergies</span>
            </div>
            {extraction.allergies && extraction.allergies.length > 0 ? (
              <p className="text-slate-800 font-medium leading-snug">
                {extraction.allergies.join(', ')}
              </p>
            ) : (
              <span className="text-slate-400 italic text-xs font-normal">None reported</span>
            )}
          </div>
        </div>

        {/* Medical History */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-medium mb-1 text-xs">
            Past Medical Conditions
          </div>
          {extraction.medicalHistory && extraction.medicalHistory.length > 0 ? (
            <p className="text-slate-800 leading-snug font-medium">
              {extraction.medicalHistory.join(', ')}
            </p>
          ) : (
            <span className="text-slate-400 italic text-xs font-normal">None recorded</span>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      {onProceedToReview && (
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <button
            type="button"
            onClick={onProceedToReview}
            className="btn-primary w-full justify-center !py-3 !text-sm"
          >
            <span>Review & Submit Case</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </aside>
  );
}
