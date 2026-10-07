'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PatientHeader from '@/components/PatientHeader';
import { PatientProfile, LanguageOption, GenderOption } from '@/lib/types';
import { getStoredPatient, setStoredPatient, DEFAULT_DEMO_PATIENT } from '@/lib/storage';
import { User, Calendar, ArrowRight, Sparkles, ShieldCheck, Globe } from 'lucide-react';

const LANGUAGE_OPTIONS: { value: LanguageOption; label: string; native: string; flag: string }[] = [
  { value: 'English',  label: 'English',  native: 'English',   flag: '🇬🇧' },
  { value: 'Hindi',    label: 'Hindi',    native: 'हिंदी',      flag: '🇮🇳' },
  { value: 'Hinglish', label: 'Hinglish', native: 'Hindi+Eng', flag: '🔀' },
  { value: 'Spanish',  label: 'Spanish',  native: 'Español',   flag: '🇪🇸' },
  { value: 'Tamil',    label: 'Tamil',    native: 'தமிழ்',      flag: '🇮🇳' },
  { value: 'Bengali',  label: 'Bengali',  native: 'বাংলা',      flag: '🇧🇩' },
  { value: 'Marathi',  label: 'Marathi',  native: 'मराठी',      flag: '🇮🇳' },
  { value: 'Telugu',   label: 'Telugu',   native: 'తెలుగు',     flag: '🇮🇳' },
];

const GENDER_OPTIONS: GenderOption[] = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function PatientProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile>(DEFAULT_DEMO_PATIENT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = getStoredPatient();
    if (stored) setProfile(stored);
  }, []);

  const handleQuickDemoFill = () => {
    setProfile({ name: 'Akash Singh', age: 20, gender: 'Male', language: 'English', consentGiven: false });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!profile.name?.trim()) newErrors.name = 'Please enter your full name.';
    if (!profile.age || profile.age < 1 || profile.age > 120)
      newErrors.age = 'Please enter a valid age (1–120).';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setStoredPatient(profile);
    await new Promise(r => setTimeout(r, 200));
    router.push('/patient/consent');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <PatientHeader patient={profile} currentStep={1} />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-start justify-center">
        <div className="w-full max-w-lg">

          {/* Clean White Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-9 shadow-lg">

            {/* Header */}
            <div className="flex items-start justify-between mb-8 pb-5 border-b border-slate-100">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Your Visit Profile
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Step 1 of 5 · Basic details before starting your consultation prep
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors shadow-xs"
                title="Fill with sample demo data"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Fill Sample
              </button>
            </div>

            <form onSubmit={handleContinue} className="space-y-6" noValidate>

              {/* Full Name */}
              <div>
                <label htmlFor="patient-full-name" className="block text-sm font-semibold mb-2 text-slate-800">
                  Full Name <span className="text-sky-600" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400" aria-hidden="true">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="patient-full-name"
                    type="text"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    value={profile.name}
                    onChange={(e) => {
                      setProfile({ ...profile, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    placeholder="e.g. Akash Singh"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 min-h-[48px] transition-all text-base"
                  />
                </div>
                {errors.name && (
                  <p id="name-error" role="alert" className="text-sm font-medium mt-1.5 text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Age + Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label htmlFor="patient-age" className="block text-sm font-semibold mb-2 text-slate-800">
                    Age (years) <span className="text-sky-600" aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400" aria-hidden="true">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      id="patient-age"
                      type="number"
                      required
                      aria-required="true"
                      min={1}
                      max={120}
                      aria-invalid={!!errors.age}
                      aria-describedby={errors.age ? 'age-error' : undefined}
                      value={profile.age || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, age: parseInt(e.target.value, 10) || 0 });
                        if (errors.age) setErrors({ ...errors, age: '' });
                      }}
                      placeholder="e.g. 28"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 min-h-[48px] transition-all text-base"
                    />
                  </div>
                  {errors.age && (
                    <p id="age-error" role="alert" className="text-sm font-medium mt-1.5 text-red-600">
                      {errors.age}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="patient-gender" className="block text-sm font-semibold mb-2 text-slate-800">
                    Gender
                  </label>
                  <select
                    id="patient-gender"
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value as GenderOption })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 min-h-[48px] transition-all text-base cursor-pointer"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Language */}
              <fieldset>
                <legend className="block text-sm font-semibold mb-3 text-slate-800">
                  <Globe className="w-4 h-4 inline mr-1.5 text-sky-600" aria-hidden="true" />
                  What language do you prefer to speak or type in?
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const selected = profile.language === lang.value;
                    return (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, language: lang.value })}
                        aria-pressed={selected}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-sky-100 text-sky-800 border-2 border-sky-600 shadow-sm'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50'
                        }`}
                        style={{ minHeight: '66px' }}
                      >
                        <span className="text-xl mb-0.5" aria-hidden="true">{lang.flag}</span>
                        <span>{lang.label}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{lang.native}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Privacy Notice */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs sm:text-sm text-slate-700">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  Your answers are shared only with your attending physician to prepare your case sheet. Nothing is shared with third parties.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full justify-center text-base !py-3.5 font-bold shadow-md"
              >
                {saving ? 'Saving...' : 'Continue to Clinical Consent'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
