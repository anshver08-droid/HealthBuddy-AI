'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
  MessageCircle,
  FileText,
  Clock,
  Globe,
  Heart,
  Sparkles,
  Users,
  ChevronRight,
  Activity,
  Check,
} from 'lucide-react';

// ── Animated Counter Hook ──────────────────────────────────────────────────
function useCounter(target: number, duration: number = 1600, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Intersection Observer ──────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Live Intake Conversation Preview ───────────────────────────────────────
const PREVIEW_TURNS = [
  { sender: 'ai', text: 'Hello! What health concern or symptoms bring you in today?' },
  { sender: 'patient', text: "I've had a bad headache and feeling dizzy since yesterday morning." },
  { sender: 'ai', text: 'I understand. On a scale of 1 to 10, how severe is the pain right now?' },
  { sender: 'patient', text: 'Around a 6/10. It throbs at the temples and light makes it worse.' },
  { sender: 'ai', text: 'Thank you. Have you taken any medications like Paracetamol or have any allergies?' },
];

function InteractiveIntakePreview() {
  const [stepIndex, setStepIndex] = useState(1);
  const { ref, inView } = useInView(0.25);

  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(() => {
      setStepIndex((curr) => {
        if (curr >= PREVIEW_TURNS.length) {
          clearInterval(timer);
          return curr;
        }
        return curr + 1;
      });
    }, 1100);
    return () => clearInterval(timer);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="w-full rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden"
      style={{
        boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.15), 0 1px 3px rgba(0,0,0,0.05)',
      }}
      aria-label="Interactive intake demo"
    >
      {/* Chrome header */}
      <div className="bg-sky-50/70 px-5 py-3.5 border-b border-sky-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
            Health Buddy · Live Pre-Consultation
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-sky-700 border border-sky-200">
          Doctor Ready
        </span>
      </div>

      {/* Messages */}
      <div className="p-5 sm:p-6 space-y-3.5 min-h-[290px] bg-gradient-to-b from-white to-sky-50/30">
        {PREVIEW_TURNS.slice(0, stepIndex).map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2.5 animate-bubble-in ${
              msg.sender === 'ai' ? 'justify-start' : 'justify-end'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                AI
              </div>
            )}
            <div
              className={`max-w-[82%] px-4 py-2.5 text-sm sm:text-base leading-relaxed ${
                msg.sender === 'ai'
                  ? 'bubble-ai'
                  : 'bubble-patient'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {stepIndex < PREVIEW_TURNS.length && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
              AI
            </div>
            <div className="bubble-ai px-4 py-3 flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-sky-500 typing-dot-1" />
              <div className="w-2 h-2 rounded-full bg-sky-500 typing-dot-2" />
              <div className="w-2 h-2 rounded-full bg-sky-500 typing-dot-3" />
            </div>
          </div>
        )}
      </div>

      {/* Structured extraction preview bar */}
      <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-800">Structured Extracted Sheet:</span>
          <span className="hidden sm:inline text-sky-700 font-medium">Headache (6/10) · Bilateral · Photophobia</span>
        </div>
        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          85% Complete
        </span>
      </div>
    </div>
  );
}

// ── Language Selector Pills ────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'HI', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'HG', label: 'Hinglish', flag: '🔀' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'TA', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'BN', label: 'বাংলা', flag: '🇧🇩' },
];

export default function LandingPage() {
  const [activeLang, setActiveLang] = useState('EN');
  const { ref: statsRef, inView: statsInView } = useInView(0.2);

  const patientsCount = useCounter(2800, 1600, statsInView);
  const timeSaved = useCounter(12, 1200, statsInView);
  const satisfaction = useCounter(98, 1600, statsInView);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      <Navbar />

      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>

        {/* ─── HERO SECTION (Included Health Style) ───────────────── */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-sky-50/70 via-white to-white border-b border-slate-100">
          {/* Subtle light blue background orb */}
          <div
            className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

              {/* Left Column: Core Messaging */}
              <div className="lg:col-span-7 space-y-6">
                {/* Pill Tag */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs sm:text-sm font-semibold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                  <span>Personalized Pre-Consultation Virtual Intake</span>
                </div>

                {/* Big Clear Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                  We Listen{' '}
                  <span className="text-sky-600">
                    Before
                  </span>{' '}
                  Your Doctor Does.
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-normal max-w-2xl">
                  Health Buddy asks you simple questions about how you feel. Then it gives your doctor a clear, structured summary, so your visit starts with what matters.
                </p>

                {/* Who it's for */}
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  For patients getting ready for a visit, and doctors who want a clear summary.
                </p>

                {/* Why it matters list */}
                <ul className="space-y-3 pt-1 text-base text-slate-700 font-medium">
                  {[
                    'You feel heard, and nothing gets forgotten in the exam room.',
                    'Your doctor saves precious time and sees the full clinical picture.',
                    'You can go at your own pace, in plain language or your native tongue.',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-sky-600 font-bold" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Included Health Style Pill CTAs */}
                <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Link
                    href="/patient"
                    className="btn-primary text-base font-bold !py-3.5 !px-8 shadow-lg"
                  >
                    <span>Start my visit prep</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <Link
                    href="/doctor"
                    className="btn-secondary text-base font-semibold !py-3.5 !px-6"
                  >
                    <Stethoscope className="w-4 h-4 text-sky-600" aria-hidden="true" />
                    <span>I&apos;m a doctor: open dashboard</span>
                  </Link>
                </div>

                {/* Trust Line */}
                <div className="pt-2 flex items-start gap-2.5 text-sm sm:text-base text-slate-600 max-w-xl">
                  <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Health Buddy doesn&apos;t diagnose or give medical advice.
                    Your doctor makes every medical decision.
                  </span>
                </div>
              </div>

              {/* Right Column: Live Interactive Preview */}
              <div className="lg:col-span-5 space-y-5">
                <InteractiveIntakePreview />

                {/* Multilingual Selector Bar */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5 text-sky-800">
                      <Globe className="w-3.5 h-3.5" />
                      Available in your preferred language:
                    </span>
                    <span className="text-sky-600 font-bold">8 Languages</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLang(lang.code)}
                        className={`lang-option text-xs !py-1.5 !px-3 ${
                          activeLang === lang.code ? 'selected' : ''
                        }`}
                      >
                        <span aria-hidden="true">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS STRIP ────────────────────────────────────────── */}
        <section
          ref={statsRef}
          className="py-12 bg-white border-b border-slate-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-sky-600">
                  {patientsCount}+
                </div>
                <div className="text-sm font-semibold text-slate-600 mt-1">
                  Patient intakes structured
                </div>
              </div>
              <div className="pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {timeSaved} min
                </div>
                <div className="text-sm font-semibold text-slate-600 mt-1">
                  Saved per doctor consultation
                </div>
              </div>
              <div className="pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                  {satisfaction}%
                </div>
                <div className="text-sm font-semibold text-slate-600 mt-1">
                  Physician verification rating
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── DUAL AUDIENCE CARDS (Included Health Style) ─────────── */}
        <section className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100/80 px-3 py-1 rounded-full border border-sky-200">
                Two Purpose-Built Experiences
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
                Built for patients and clinicians alike.
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mt-2">
                Removing friction from healthcare consultations through thoughtful, non-diagnostic AI support.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Patient Experience Card */}
              <div className="audience-card flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                      For Patients & Families
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      A calm, conversational intake room
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-base">
                    No confusing medical checkboxes or rushed appointments. Speak or type in your natural words, review everything before sending, and take your time.
                  </p>

                  <div className="space-y-2 pt-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-600" />
                      <span>Natural voice input and conversational questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-600" />
                      <span>Support for 8 languages including Hindi & Spanish</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-600" />
                      <span>Full review step: you see what goes to your doctor</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    href="/patient"
                    className="btn-primary w-full sm:w-auto justify-center"
                  >
                    <span>Start Patient Intake</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Doctor Experience Card */}
              <div className="audience-card flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                      For Doctors & Clinics
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      High-density clinical dashboard
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-base">
                    Review incoming chief complaints, duration, severity, and potential red flags before entering the room. Edit notes and verify details with one click.
                  </p>

                  <div className="space-y-2 pt-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-600" />
                      <span>Structured case registry with urgency triage tagging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-600" />
                      <span>Inline editing of all extracted parameters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-600" />
                      <span>Full verbatim patient transcript preserved</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    href="/doctor"
                    className="btn-secondary w-full sm:w-auto justify-center"
                  >
                    <span>Open Doctor Console</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS (3 Simple Steps) ──────────────────────── */}
        <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100/80 px-3 py-1 rounded-full border border-sky-200">
                Simple Flow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
                How Health Buddy works
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mt-2">
                A seamless 3-step bridge between the patient&apos;s story and the physician&apos;s clinical workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Describe symptoms',
                  desc: 'Patients share what brings them in using voice or text in their preferred language. No medical knowledge required.',
                  icon: MessageCircle,
                },
                {
                  step: '02',
                  title: 'Adaptive follow-ups',
                  desc: 'Health Buddy asks simple clarifying questions about duration, severity, and timeline without diagnosing.',
                  icon: Activity,
                },
                {
                  step: '03',
                  title: 'Doctor verification',
                  desc: 'The attending physician receives an organized case summary, reviews it, and makes all clinical decisions.',
                  icon: FileText,
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="p-8 rounded-3xl bg-sky-50/50 border border-sky-100 space-y-4 hover:border-sky-300 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-sky-200 flex items-center justify-center text-sky-600">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                        STEP {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                    <p className="text-slate-600 text-base leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── RESPONSIBLE MEDICAL AI PRINCIPLES ───────────────────── */}
        <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-sky-600 shrink-0" aria-hidden="true" />
                <h3 className="text-2xl font-bold text-slate-900">
                  Responsible Clinical Intake Principles
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-1">Non-Diagnostic</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Health Buddy never diagnoses disease or prescribes medications.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-1">Human-in-the-Loop</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Attending doctors verify, edit, and sign off on all case summaries.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-1">Accessibility First</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    WCAG 2.2 AA compliant, large text, voice input, and 8 languages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─────────────────────────────────────────── */}
        <section className="py-20 text-center bg-gradient-to-b from-white to-sky-50/80">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Ready for your appointment?
            </h2>
            <p className="text-lg text-slate-600">
              Prepare your story in advance so your doctor can give you their full, undivided attention.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href="/patient"
                className="btn-primary w-full sm:w-auto text-base !py-3.5 !px-8 shadow-lg"
              >
                Start my visit prep
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/doctor/cases"
                className="btn-secondary w-full sm:w-auto text-base !py-3.5 !px-6"
              >
                Inspect doctor cases
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
