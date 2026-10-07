import React from 'react';
import { TriageUrgency } from '@/lib/types';
import { AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';

interface TriageBadgeProps {
  urgency: TriageUrgency;
  size?: 'sm' | 'md';
}

export default function TriageBadge({ urgency, size = 'md' }: TriageBadgeProps) {
  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'text-xs px-2.5 py-0.5' : 'text-xs sm:text-sm px-3.5 py-1';

  switch (urgency) {
    case 'urgent':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-red-50 text-red-800 border border-red-300 shadow-2xs ${sizeClasses}`}
        >
          <AlertOctagon className={isSmall ? 'w-3.5 h-3.5 text-red-600' : 'w-4 h-4 text-red-600'} aria-hidden="true" />
          <span>Urgent Attention</span>
        </span>
      );
    case 'priority':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs ${sizeClasses}`}
        >
          <AlertTriangle className={isSmall ? 'w-3.5 h-3.5 text-amber-600' : 'w-4 h-4 text-amber-600'} aria-hidden="true" />
          <span>Priority Review</span>
        </span>
      );
    case 'routine':
    default:
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs ${sizeClasses}`}
        >
          <CheckCircle className={isSmall ? 'w-3.5 h-3.5 text-slate-500' : 'w-4 h-4 text-slate-500'} aria-hidden="true" />
          <span>Routine Intake</span>
        </span>
      );
  }
}
