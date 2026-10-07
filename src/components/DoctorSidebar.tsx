'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { DoctorStats } from '@/lib/types';

interface DoctorSidebarProps {
  stats?: DoctorStats;
}

export default function DoctorSidebar({ stats }: DoctorSidebarProps) {
  const pathname = usePathname();

  const links = [
    {
      name: 'Overview',
      href: '/doctor',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Incoming Cases',
      href: '/doctor/cases',
      icon: FolderOpen,
      badge: stats?.pendingReviewCount ? `${stats.pendingReviewCount}` : null,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
    },
    {
      name: 'Verified Archive',
      href: '/doctor/cases?filter=verified',
      icon: CheckCircle2,
      badge: stats?.reviewedTodayCount ? `${stats.reviewedTodayCount}` : null,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    {
      name: 'Clinical Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside aria-label="Physician Navigation" className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] shadow-xs">
      {/* Doctor Card */}
      <div className="p-4 border-b border-slate-200 bg-sky-50/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-sm shadow-xs">
            AS
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Dr. Arvind Sharma, MD
            </h3>
            <p className="text-xs text-sky-700 font-semibold">Internal Medicine</p>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
              <span>Attending Physician</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Doctor views" className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== '/doctor' && pathname?.startsWith(link.href.split('?')[0]));
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-sky-600 text-white font-bold shadow-md'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-sky-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} aria-hidden="true" />
                <span>{link.name}</span>
              </div>
              {link.badge && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${link.badgeColor}`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Triage Summary Box */}
      {stats && (
        <div className="p-3.5 m-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-bold">Intake Queue Status</span>
            <Activity className="w-4 h-4 text-sky-600" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-amber-700 font-extrabold text-sm">{stats.pendingReviewCount}</div>
              <div className="text-xs text-slate-500">Pending</div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-emerald-700 font-extrabold text-sm">{stats.reviewedTodayCount}</div>
              <div className="text-xs text-slate-500">Verified</div>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Authority Disclaimer */}
      <div className="p-4 border-t border-slate-200 bg-sky-50/50 text-xs text-slate-600">
        <div className="flex items-center space-x-1.5 text-sky-700 font-bold mb-1">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          <span>Doctor Authority</span>
        </div>
        <p className="leading-relaxed">
          Health Buddy organizes intake details. Clinical diagnosis and treatment decisions remain solely with the physician.
        </p>
      </div>
    </aside>
  );
}
