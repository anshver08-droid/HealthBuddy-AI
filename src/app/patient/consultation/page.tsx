'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PatientHeader from '@/components/PatientHeader';
import ChatWindow from '@/components/ChatWindow';
import CaseInformationPanel from '@/components/CaseInformationPanel';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  ChatMessage,
  ClinicalExtraction,
  PatientProfile,
  CaseCompleteness,
  ConsultationCase,
} from '@/lib/types';
import {
  getStoredPatient,
  getStoredCase,
  setStoredCase,
  getStoredSettings,
  DEFAULT_DEMO_PATIENT,
} from '@/lib/storage';
import { createInitialExtraction, calculateCompleteness } from '@/lib/ai/adaptiveEngine';

export default function ConsultationPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_DEMO_PATIENT);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [extraction, setExtraction] = useState<ClinicalExtraction>(createInitialExtraction());
  const [completeness, setCompleteness] = useState<CaseCompleteness>(
    calculateCompleteness(createInitialExtraction())
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [consultationId, setConsultationId] = useState<string>('DR-2048');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const loadedPatient = getStoredPatient();
    setPatient(loadedPatient);

    // Generate or restore consultation ID
    const existingCase = getStoredCase();
    if (existingCase && existingCase.patient.name === loadedPatient.name) {
      setConsultationId(existingCase.id);
      setMessages(existingCase.messages);
      setExtraction(existingCase.extractedData);
      setCompleteness(existingCase.completeness);
    } else {
      const newId = `DR-${Math.floor(1000 + Math.random() * 9000)}`;
      setConsultationId(newId);

      // Initial Greeting depending on patient language
      let greeting = `Hello ${loadedPatient.name || 'there'}. I'm here to collect some information before your doctor consultation. Please describe what health concern or symptoms are bothering you today.`;
      let quickReplies = ['Headaches for 3 days', 'Stomach pain', 'Fever and body aches', 'Cough and chest congestion', 'Back pain'];

      if (loadedPatient.language === 'Hindi') {
        greeting = `नमस्ते ${loadedPatient.name || ''} जी। मैं डॉक्टर परामर्श से पहले आपकी मुख्य तकलीफ समझने के लिए उपस्थित हूँ। कृपया बताइए कि आज आपको क्या समस्या हो रही है?`;
        quickReplies = ['3 दिनों से सिर दर्द है', 'पेट में दर्द है', 'तेज बुखार और बदन दर्द', 'खांसी और जुकाम', 'कमर में तेज दर्द'];
      } else if (loadedPatient.language === 'Hinglish') {
        greeting = `Hello ${loadedPatient.name || ''}! Main doctor consultation se pehle aapki clinical information record kar raha hoon. Please bataiye aaj aapko kya issue ho raha hai?`;
        quickReplies = ['3 din se headache ho raha hai', 'Pet me sharp dard hai', 'Fever aur weakness hai', 'Khansi aur cold', 'Kamar me dard hai'];
      } else if (loadedPatient.language === 'Spanish') {
        greeting = `Hola ${loadedPatient.name || ''}. Estoy aquí para recopilar información antes de su consulta. ¿Cuál es el problema de salud que le trae hoy?`;
        quickReplies = ['Dolor de cabeza', 'Dolor de estómago', 'Fiebre y cansancio', 'Tos y congestión', 'Dolor de espalda'];
      } else if (loadedPatient.language === 'Tamil') {
        greeting = `வணக்கம் ${loadedPatient.name || ''}. இன்று உங்களுக்கு என்ன உடல் பிரச்சனை இருக்கிறது என்று சொல்லுங்கள்.`;
        quickReplies = ['தலைவலி', 'வயிற்று வலி', 'காய்ச்சல்', 'இருமல்', 'முதுகு வலி'];
      } else if (loadedPatient.language === 'Bengali') {
        greeting = `নমস্কার ${loadedPatient.name || ''}। আজ আপনার কী শারীরিক সমস্যা আছে সেটি বলুন।`;
        quickReplies = ['মাথাব্যথা', 'পেটে ব্যথা', 'জ্বর ও দুর্বলতা', 'কাশি ও সর্দি', 'পিঠে ব্যথা'];
      }

      const initialAiMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies,
      };

      setMessages([initialAiMessage]);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const activeSettings = getStoredSettings();
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          patient,
          currentExtraction: extraction,
          demoMode: activeSettings.demoMode,
        }),
      });

      if (!response.ok) {
        throw new Error('API response failed');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: data.aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: data.quickReplies,
        isUrgentAlert: data.isUrgentAlert,
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      setExtraction(data.extractedData);
      setCompleteness(data.completeness);

      // Persist active case state
      const currentCase: ConsultationCase = {
        id: consultationId,
        patient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Pending',
        messages: updatedMessages,
        extractedData: data.extractedData,
        completeness: data.completeness,
        aiSummary: data.extractedData.summary || '',
      };
      setStoredCase(currentCase);

      if (data.isUrgentAlert) {
        setToast({
          id: `toast-${Date.now()}`,
          type: 'error',
          title: 'Triage Urgency Notice',
          message:
            'Potentially urgent symptoms detected. Please consider seeking emergency healthcare if symptoms are acute.',
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setToast({
        id: `toast-${Date.now()}`,
        type: 'error',
        title: 'Network / Sync Alert',
        message:
          'Something went wrong while processing your response. Your previous information has been saved. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToReview = () => {
    // Save state and redirect to review
    const finalCase: ConsultationCase = {
      id: consultationId,
      patient,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Pending',
      messages,
      extractedData: extraction,
      completeness,
      aiSummary: '',
    };
    setStoredCase(finalCase);
    router.push('/patient/review');
  };

  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);

  return (
    <div className="h-screen flex flex-col bg-white text-slate-900 overflow-hidden">
      <Navbar />
      <PatientHeader patient={patient} currentStep={3} consultationId={consultationId} />

      {/* Main Split Layout: Left Chat (65%) | Right Case Sheet (35%) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-1 h-full flex flex-col min-w-0">
          <ChatWindow
            messages={messages}
            patient={patient}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            language={patient.language}
            isUrgentAlert={extraction.urgencyLevel === 'urgent'}
          />
        </div>

        {/* Right Side Live Case Sheet (Desktop) */}
        <div className="hidden lg:block w-96 xl:w-[420px] h-full shrink-0">
          <CaseInformationPanel
            extraction={extraction}
            completeness={completeness}
            onProceedToReview={handleProceedToReview}
          />
        </div>

        {/* Mobile Slide-over Drawer for Case Sheet */}
        {showMobileDrawer && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
            <div className="w-5/6 max-w-md h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl relative">
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-sky-50">
                <span className="text-sm font-bold text-slate-900">Live Case Sheet</span>
                <button
                  type="button"
                  onClick={() => setShowMobileDrawer(false)}
                  className="px-3 py-1.5 rounded-full bg-white text-xs font-semibold text-slate-700 hover:text-slate-950 border border-slate-200 min-h-[36px]"
                >
                  Close ✕
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <CaseInformationPanel
                  extraction={extraction}
                  completeness={completeness}
                  onProceedToReview={() => {
                    setShowMobileDrawer(false);
                    handleProceedToReview();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Bar */}
        <div className="lg:hidden p-3 bg-white border-t border-slate-200 flex items-center justify-between z-10 shadow-sm">
          <button
            type="button"
            onClick={() => setShowMobileDrawer(true)}
            className="flex items-center space-x-1.5 text-xs text-sky-800 bg-sky-50 px-3.5 py-2 rounded-full border border-sky-200 min-h-[44px] font-semibold"
          >
            <span>Live Sheet:</span>
            <span className="font-extrabold text-sky-600 font-mono">
              {completeness?.percentage || 0}%
            </span>
            <span className="text-sky-700 text-xs">View</span>
          </button>
          <button
            type="button"
            onClick={handleProceedToReview}
            className="btn-primary !py-2.5 !px-5 text-xs sm:text-sm font-bold shadow-md"
          >
            Review Case Sheet →
          </button>
        </div>
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
