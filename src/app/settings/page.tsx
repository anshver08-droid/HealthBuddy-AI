'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  getStoredSettings,
  setStoredSettings,
  AppSettings,
  DEFAULT_SETTINGS,
} from '@/lib/storage';
import {
  Mic,
  Sliders,
  Stethoscope,
  ShieldCheck,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Check,
  Zap,
  Activity,
  AlertCircle,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    model?: string;
    message: string;
    latencyMs?: number;
  } | null>(null);

  useEffect(() => {
    const s = getStoredSettings();
    setSettings(s);
  }, []);

  const handleSelectMode = (demoModeValue: boolean) => {
    const updated = { ...settings, demoMode: demoModeValue };
    setSettings(updated);
    setStoredSettings(updated);

    if (demoModeValue) {
      setToast({
        id: `toast-${Date.now()}`,
        type: 'info',
        title: 'Demo Mode Activated',
        message: 'Intake is now powered by the offline Adaptive Clinical Engine (Zero API latency).',
      });
    } else {
      setToast({
        id: `toast-${Date.now()}`,
        type: 'success',
        title: 'Live Gemini Mode Activated',
        message: 'Intake will now query Google Gemini 3.5 Flash for live dynamic reasoning & translation.',
      });
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/test');
      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        setToast({
          id: `toast-${Date.now()}`,
          type: 'success',
          title: 'Gemini Connection Verified',
          message: `${data.model || 'Gemini 3.5'} is operational (${data.latencyMs}ms roundtrip).`,
        });
      } else {
        setToast({
          id: `toast-${Date.now()}`,
          type: 'error',
          title: 'Connection Check Failed',
          message: data.message || 'Unable to communicate with Google Gemini API.',
        });
      }
    } catch (err: any) {
      const failureObj = {
        success: false,
        message: err?.message || 'Network request failed while testing Gemini endpoint.',
      };
      setTestResult(failureObj);
      setToast({
        id: `toast-${Date.now()}`,
        type: 'error',
        title: 'Connection Error',
        message: failureObj.message,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = () => {
    setStoredSettings(settings);
    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      title: 'Settings Saved',
      message: 'All system preferences and clinical credentials have been updated successfully.',
    });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setStoredSettings(DEFAULT_SETTINGS);
    setTestResult(null);
    setToast({
      id: `toast-${Date.now()}`,
      type: 'info',
      title: 'Settings Reset',
      message: 'Preferences restored to default profile.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
                <Sliders className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <span>Configuration Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                System & AI Engine Settings
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Select your intake engine, test live Gemini connectivity, and manage clinical parameters.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary !py-2 !px-4 text-xs sm:text-sm font-semibold shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn-primary !py-2.5 !px-5 text-xs sm:text-sm font-bold shadow-md"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {/* 1. AI CONSULTATION ENGINE SELECTION */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-sky-600" aria-hidden="true" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      AI Consultation Engine Mode
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                    Click either mode below to activate it instantly for your consultation intake.
                  </p>
                </div>

                {/* Status Indicator Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-500 font-medium">Active Mode:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      settings.demoMode
                        ? 'bg-slate-200/80 text-slate-800'
                        : 'bg-sky-100 text-sky-800 border border-sky-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        settings.demoMode ? 'bg-slate-500' : 'bg-sky-600 animate-pulse'
                      }`}
                    />
                    {settings.demoMode ? 'Demo Mode (Offline)' : 'Live Gemini 3.5 Flash'}
                  </span>
                </div>
              </div>

              {/* Mode Selectable Cards */}
              <div
                role="radiogroup"
                aria-label="AI Consultation Engine Mode"
                className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {/* CARD 1: DEMO MODE */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={settings.demoMode}
                  onClick={() => handleSelectMode(true)}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between min-h-[160px] cursor-pointer ${
                    settings.demoMode
                      ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-2 ring-sky-200/60'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            settings.demoMode
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Cpu className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          Demo Mode
                        </span>
                      </div>

                      {/* Radio / Check Indicator */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                          settings.demoMode
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {settings.demoMode && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      Built-in Adaptive Clinical Engine. Runs fully offline with zero external API calls or latency.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500 font-medium">Guaranteed Reliability</span>
                    <span
                      className={`font-semibold ${
                        settings.demoMode ? 'text-sky-700' : 'text-slate-400'
                      }`}
                    >
                      {settings.demoMode ? '✓ Currently Active' : 'Click to Activate'}
                    </span>
                  </div>
                </button>

                {/* CARD 2: LIVE GEMINI MODE */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={!settings.demoMode}
                  onClick={() => handleSelectMode(false)}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between min-h-[160px] cursor-pointer ${
                    !settings.demoMode
                      ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-2 ring-sky-200/60'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            !settings.demoMode
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">
                            Live Gemini 3.5
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
                            Recommended
                          </span>
                        </div>
                      </div>

                      {/* Radio / Check Indicator */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                          !settings.demoMode
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {!settings.demoMode && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      Powered by official <code className="bg-slate-100 px-1 py-0.5 rounded text-sky-700">@google/genai</code> SDK using <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">gemini-3.5-flash-lite</code> with live multilingual translation.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500 font-medium">Live Google GenAI</span>
                    <span
                      className={`font-semibold ${
                        !settings.demoMode ? 'text-sky-700' : 'text-slate-400'
                      }`}
                    >
                      {!settings.demoMode ? '✓ Currently Active' : 'Click to Activate'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Gemini Connection Diagnostic & Verification Box */}
              <div className="mt-5 p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <Activity className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Google Gemini API Status & Diagnostic
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Verify that your API key is authentic and communicating with Google Cloud.
                    </div>
                    {testResult && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs">
                        {testResult.success ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {testResult.message} ({testResult.latencyMs}ms)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            {testResult.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={testingConnection}
                  onClick={handleTestConnection}
                  className="btn-secondary !py-2 !px-3.5 text-xs font-semibold self-start sm:self-auto shrink-0 shadow-xs flex items-center space-x-1.5"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-sky-600 ${
                      testingConnection ? 'animate-spin' : ''
                    }`}
                  />
                  <span>{testingConnection ? 'Testing API...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {/* 2. VOICE & SPEECH INPUT */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-sky-600" aria-hidden="true" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Speech-to-Text Microphone Input
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                    Enables browser Web Speech API for hands-free patient voice responses with live transcript editing across English, Hindi, and Spanish.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={settings.enableVoice}
                    onChange={(e) => {
                      const updated = { ...settings, enableVoice: e.target.checked };
                      setSettings(updated);
                      setStoredSettings(updated);
                    }}
                    aria-label="Toggle Speech Input"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
            </div>

            {/* 3. PHYSICIAN CONSOLE CONFIGURATION */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-sm sm:text-base font-bold text-slate-900">
                <Stethoscope className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <span>Physician Profile & Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label htmlFor="settings-doctor-name" className="block text-slate-700 font-semibold mb-1.5">
                    Attending Physician Name
                  </label>
                  <input
                    id="settings-doctor-name"
                    type="text"
                    value={settings.doctorName}
                    onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 min-h-[44px]"
                  />
                </div>

                <div>
                  <label htmlFor="settings-doctor-specialty" className="block text-slate-700 font-semibold mb-1.5">
                    Medical Specialty / Department
                  </label>
                  <input
                    id="settings-doctor-specialty"
                    type="text"
                    value={settings.doctorSpecialty}
                    onChange={(e) =>
                      setSettings({ ...settings, doctorSpecialty: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* 4. CLINICAL SAFETY & ETHICAL BOUNDARY */}
            <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-slate-700 space-y-2">
              <div className="flex items-center space-x-2 text-sky-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <span>Clinical Governance & Ethical Boundary</span>
              </div>
              <p className="leading-relaxed">
                Health Buddy strictly adheres to human-in-the-loop healthcare principles. All models are prompted never to emit definitive diagnoses, prescribe medications, or replace direct physician consultations.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
