import React from 'react';
import { PatientProfile } from '@/lib/types';
import { User, Globe, Check, ShieldCheck, MessageSquare, ClipboardCheck, Send } from 'lucide-react';

interface PatientHeaderProps {
  patient: PatientProfile;
  currentStep: 1 | 2 | 3 | 4 | 5;
  consultationId?: string;
}

export default function PatientHeader({
  patient,
  currentStep,
  consultationId,
}: PatientHeaderProps) {
  const steps = [
    { num: 1, label: 'Profile', icon: User },
    { num: 2, label: 'Consent', icon: ShieldCheck },
    { num: 3, label: 'AI Intake', icon: MessageSquare },
    { num: 4, label: 'Review', icon: ClipboardCheck },
    { num: 5, label: 'Submitted', icon: Send },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Patient Profile Badges */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-sm">
            {patient.name
              ? patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'PT'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {patient.name || 'Patient'}
              </h2>
              {consultationId && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  ID: {consultationId}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500 mt-0.5">
              <span>{patient.age ? `${patient.age} yrs` : 'Age pending'}</span>
              <span>•</span>
              <span>{patient.gender || 'Not specified'}</span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-sky-700 font-medium">
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{patient.language || 'English'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <nav aria-label="Intake progress" className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto py-1">
          {steps.map((s, idx) => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <React.Fragment key={s.num}>
                <div
                  className="flex items-center space-x-1.5 shrink-0"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : isCurrent
                        ? 'bg-sky-600 text-white font-extrabold shadow-sm'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 text-emerald-700" aria-hidden="true" /> : s.num}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isCurrent
                        ? 'text-sky-700 font-bold'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`w-3 sm:w-6 h-[2px] rounded-full transition-colors ${
                      s.num < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
