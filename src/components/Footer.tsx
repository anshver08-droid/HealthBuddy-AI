import React from 'react';
import Link from 'next/link';
import { HeartPulse, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-slate-50 border-t border-slate-200 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Disclaimer block in soft sky blue */}
        <div className="mb-10 p-5 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3.5 flex-1">
            <div className="p-2.5 rounded-xl bg-white border border-sky-200 text-sky-600 shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Clinical Workflow Assistance Notice
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                Health Buddy is a <strong className="text-slate-900">pre-consultation intake tool</strong> — it does not diagnose medical conditions, prescribe medications, or replace clinician judgment. All clinical summaries require verification by a licensed healthcare professional.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10 text-sm">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">Health Buddy</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Included Health-inspired virtual pre-consultation intake. Helping patients express their story and saving doctors clinical time.
            </p>
          </div>

          {/* Patient Flow */}
          <div>
            <h5 className="font-bold uppercase tracking-wider text-xs mb-3 text-slate-900">
              For Patients
            </h5>
            <ul className="space-y-2">
              {[
                { href: '/patient', label: 'Start Visit Prep' },
                { href: '/patient/consent', label: 'Clinical Consent' },
                { href: '/patient/consultation', label: 'Intake Room' },
                { href: '/patient/review', label: 'Review & Edit' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-sky-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinician Flow */}
          <div>
            <h5 className="font-bold uppercase tracking-wider text-xs mb-3 text-slate-900">
              For Clinicians
            </h5>
            <ul className="space-y-2">
              {[
                { href: '/doctor', label: 'Doctor Dashboard' },
                { href: '/doctor/cases', label: 'Case Registry' },
                { href: '/doctor/cases/DR-2048', label: 'Sample Case Review' },
                { href: '/settings', label: 'Settings' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-sky-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety & Standards */}
          <div>
            <h5 className="font-bold uppercase tracking-wider text-xs mb-3 text-slate-900">
              Safety & Standards
            </h5>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>8 Supported Languages</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>Voice & Keyboard Friendly</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>WCAG 2.2 AA Accessible</span>
              </li>
              <li className="flex items-center gap-1.5 text-red-600 font-semibold mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Emergency: 112 / 911</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Health Buddy · Pre-consultation clinical workflow prototype</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Demo Mode Active</span>
            </span>
            <span>•</span>
            <Link href="/login" className="hover:text-sky-600 transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
