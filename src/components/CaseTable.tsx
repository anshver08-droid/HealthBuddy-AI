'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ConsultationCase } from '@/lib/types';
import StatusBadge from './StatusBadge';
import TriageBadge from './TriageBadge';
import { Search, ChevronRight, Clock, Filter } from 'lucide-react';

interface CaseTableProps {
  cases: ConsultationCase[];
  initialFilter?: string;
}

export default function CaseTable({ cases, initialFilter = 'all' }: CaseTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>(initialFilter);

  const filteredCases = cases.filter((c) => {
    if (activeTab === 'pending' && c.status !== 'Pending' && c.status !== 'In Review') {
      return false;
    }
    if (activeTab === 'verified' && c.status !== 'Doctor Verified') {
      return false;
    }
    if (activeTab === 'urgent' && c.extractedData.urgencyLevel !== 'urgent' && c.extractedData.urgencyLevel !== 'priority') {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.patient.name.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      const matchChief = (c.extractedData.chiefComplaint || '').toLowerCase().includes(q);
      return matchName || matchId || matchChief;
    }

    return true;
  });

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hr ago`;
      return `${Math.floor(diffHours / 24)} days ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
      {/* Controls Bar: Search & Filter Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div role="tablist" aria-label="Case filter" className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Cases', count: cases.length },
            {
              id: 'pending',
              label: 'Pending Review',
              count: cases.filter((c) => c.status !== 'Doctor Verified').length,
            },
            {
              id: 'urgent',
              label: 'Priority Triage',
              count: cases.filter(
                (c) =>
                  c.extractedData.urgencyLevel === 'urgent' ||
                  c.extractedData.urgencyLevel === 'priority'
              ).length,
            },
            {
              id: 'verified',
              label: 'Doctor Verified',
              count: cases.filter((c) => c.status === 'Doctor Verified').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 min-h-[38px] ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'bg-white text-slate-700 hover:text-sky-700 hover:bg-sky-50 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id
                    ? 'bg-sky-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <label htmlFor="search-cases-input" className="sr-only">
            Search patient cases
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id="search-cases-input"
            type="text"
            placeholder="Search patient, ID, concern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-full bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 min-h-[40px] transition-all"
          />
        </div>
      </div>

      {/* Case Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-sky-50/70 text-slate-700 uppercase tracking-wider font-bold border-b border-sky-100 text-xs">
            <tr>
              <th scope="col" className="px-5 py-3.5">Patient & ID</th>
              <th scope="col" className="px-4 py-3.5">Age / Gender</th>
              <th scope="col" className="px-4 py-3.5">Chief Concern</th>
              <th scope="col" className="px-4 py-3.5">Submitted</th>
              <th scope="col" className="px-4 py-3.5">Completeness</th>
              <th scope="col" className="px-4 py-3.5">Triage</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-400" aria-hidden="true" />
                    <p className="font-bold text-sm text-slate-800">No patient cases match your filter</p>
                    <p className="text-xs text-slate-500">Try selecting a different filter or clear your search</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCases.map((caseItem) => {
                const percentage = caseItem.completeness?.percentage || 0;

                return (
                  <tr
                    key={caseItem.id}
                    className="hover:bg-sky-50/40 transition-colors group"
                  >
                    {/* Patient & ID */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/doctor/cases/${caseItem.id}`}
                        className="flex items-center space-x-3 focus:outline-none"
                      >
                        <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs shrink-0 shadow-xs">
                          {caseItem.patient.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                            {caseItem.patient.name}
                          </div>
                          <div className="font-mono text-xs text-slate-500">
                            {caseItem.id}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Age / Gender */}
                    <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                      <span>{caseItem.patient.age} yrs</span> •{' '}
                      <span className="text-slate-500">{caseItem.patient.gender}</span>
                    </td>

                    {/* Chief Concern */}
                    <td className="px-4 py-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">
                        {caseItem.extractedData.chiefComplaint || 'Pending assessment'}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {caseItem.extractedData.duration || 'Duration unrecorded'} •{' '}
                        {caseItem.extractedData.severity || 'Unrated'}
                      </div>
                    </td>

                    {/* Submitted Time */}
                    <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        <span>{formatTimeAgo(caseItem.createdAt)}</span>
                      </div>
                    </td>

                    {/* Completeness Meter */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentage >= 80
                                ? 'bg-emerald-500'
                                : percentage >= 50
                                ? 'bg-sky-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-xs text-slate-700">
                          {percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Triage */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <TriageBadge urgency={caseItem.extractedData.urgencyLevel} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={caseItem.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/doctor/cases/${caseItem.id}`}
                        className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs transition-all shadow-xs"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
