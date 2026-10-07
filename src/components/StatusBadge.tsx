import React from 'react';
import { CaseStatus } from '@/lib/types';
import { Clock, Eye, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'text-xs px-2.5 py-0.5' : 'text-xs sm:text-sm px-3.5 py-1';

  switch (status) {
    case 'Doctor Verified':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs ${sizeClasses}`}
        >
          <CheckCircle2 className={isSmall ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} aria-hidden="true" />
          <span>Doctor Verified</span>
        </span>
      );
    case 'In Review':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs ${sizeClasses}`}
        >
          <Eye className={isSmall ? 'w-3.5 h-3.5 text-sky-600' : 'w-4 h-4 text-sky-600'} aria-hidden="true" />
          <span>In Review</span>
        </span>
      );
    case 'Pending':
    default:
      return (
        <span
          className={`inline-flex items-center space-x-1.5 font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs ${sizeClasses}`}
        >
          <Clock className={isSmall ? 'w-3.5 h-3.5 text-amber-600' : 'w-4 h-4 text-amber-600'} aria-hidden="true" />
          <span>Pending Review</span>
        </span>
      );
  }
}
