'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, LanguageOption, PatientProfile } from '@/lib/types';
import VoiceInput from './VoiceInput';
import { Send, Bot, AlertTriangle, ShieldCheck, Zap, Cpu } from 'lucide-react';
import { getStoredSettings } from '@/lib/storage';

interface ChatWindowProps {
  messages: ChatMessage[];
  patient: PatientProfile;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  language: LanguageOption;
  isUrgentAlert?: boolean;
}

// ── Placeholder text per language ─────────────────────────────────────────
function getPlaceholder(language: LanguageOption): string {
  switch (language) {
    case 'Hindi':    return 'अपनी तकलीफ या लक्षण यहाँ लिखें या बोलें...';
    case 'Hinglish': return 'Apni problem yahan type karein ya mic use karein...';
    case 'Spanish':  return 'Describa sus síntomas aquí o use el micrófono...';
    case 'Tamil':    return 'உங்கள் அறிகுறிகளை இங்கே தட்டச்சு செய்யுங்கள்...';
    case 'Bengali':  return 'আপনার লক্ষণগুলি এখানে টাইপ করুন...';
    default:         return 'Describe how you feel, or answer the question...';
  }
}

export default function ChatWindow({
  messages,
  patient,
  isLoading,
  onSendMessage,
  language,
  isUrgentAlert = false,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const s = getStoredSettings();
    setIsDemoMode(s.demoMode);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
  };

  const handleQuickReply = (reply: string) => {
    if (isLoading) return;
    onSendMessage(reply);
  };

  const latestAiMessage = [...messages].reverse().find((m) => m.sender === 'ai');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
      {/* ── Clinical Safety Bar in Soft Sky Blue ── */}
      <div className="px-4 py-2.5 bg-sky-50 border-b border-sky-100 flex items-center justify-between text-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white border border-sky-200 flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-sky-600" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">Health Buddy</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" aria-hidden="true" />
              Active · Gathering story for {patient.name?.split(' ')[0] || 'your doctor'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-600 font-semibold bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
              <Cpu className="w-3 h-3 text-slate-500" aria-hidden="true" />
              <span>Demo Mode</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-sky-800 font-semibold bg-sky-100/80 px-2.5 py-1 rounded-full border border-sky-300 shadow-2xs">
              <Zap className="w-3 h-3 text-sky-600 animate-pulse" aria-hidden="true" />
              <span>Gemini 3.5 Live</span>
            </span>
          )}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-sky-800 font-semibold bg-white px-2.5 py-1 rounded-full border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
            <span>Non-diagnostic Intake</span>
          </div>
        </div>
      </div>

      {/* ── Urgent Alert Banner (Calm Red) ── */}
      {isUrgentAlert && (
        <div
          className="px-4 py-3 bg-red-50 border-b border-red-200 text-red-700 flex items-start gap-3 text-sm shrink-0 shadow-sm"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
          <span>
            <strong className="font-bold">Urgent Medical Notice:</strong> If you are experiencing acute chest pain, severe breathlessness, or a medical emergency, please call <strong>112 / 911</strong> or visit the emergency room immediately.
          </span>
        </div>
      )}

      {/* ── Messages Scroll Area ── */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Consultation messages"
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {messages.map((message) => {
          const isAi = message.sender === 'ai';

          return (
            <div
              key={message.id}
              className={`flex items-end gap-2.5 animate-bubble-in ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div
                  className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0 mb-0.5 shadow-sm"
                  aria-hidden="true"
                >
                  <Bot className="w-4 h-4 text-sky-600" />
                </div>
              )}

              <div className="flex flex-col gap-1" style={{ maxWidth: 'min(78%, 520px)' }}>
                <span
                  className={`text-xs font-semibold ${isAi ? 'text-slate-500' : 'text-right text-slate-500'}`}
                >
                  {isAi ? 'Health Buddy' : patient.name || 'You'}
                </span>

                <div
                  className={`px-4 py-3 leading-relaxed text-sm sm:text-base ${
                    isAi
                      ? 'bubble-ai'
                      : 'bubble-patient'
                  }`}
                >
                  <p className="whitespace-pre-wrap m-0">{message.text}</p>

                  {message.isUrgentAlert && (
                    <div
                      className="mt-3 p-3 rounded-xl bg-red-100/80 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-2"
                      role="alert"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
                      <span>If severe or acute, please call emergency services (112 / 911) immediately.</span>
                    </div>
                  )}
                </div>

                <span
                  className={`text-[11px] ${isAi ? 'text-left text-slate-400' : 'text-right text-slate-400'}`}
                >
                  {message.timestamp}
                </span>
              </div>

              {!isAi && (
                <div
                  className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mb-0.5 shadow-sm"
                  aria-hidden="true"
                >
                  {(patient.name || 'Y').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5 animate-bubble-in" aria-live="assertive">
            <div
              className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0 mb-0.5"
              aria-hidden="true"
            >
              <Bot className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <span className="text-xs font-semibold block mb-1 text-slate-500">
                Health Buddy
              </span>
              <div className="bubble-ai px-4 py-3 flex items-center gap-1.5">
                <span className="sr-only">Health Buddy is typing...</span>
                <div className="w-2 h-2 rounded-full bg-sky-500 typing-dot-1" aria-hidden="true" />
                <div className="w-2 h-2 rounded-full bg-sky-500 typing-dot-2" aria-hidden="true" />
                <div className="w-2 h-2 rounded-full bg-sky-500 typing-dot-3" aria-hidden="true" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* ── Quick Replies in Soft Light Blue Pills ── */}
      {latestAiMessage?.quickReplies && latestAiMessage.quickReplies.length > 0 && !isLoading && (
        <div
          className="px-4 py-3 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 shadow-sm"
          aria-label="Suggested quick replies"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
            Suggested:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {latestAiMessage.quickReplies.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickReply(reply)}
                disabled={isLoading}
                className="quick-pill shrink-0"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 bg-white border-t border-slate-200 shrink-0 shadow-sm">
        <form onSubmit={handleSubmit} className="flex items-end gap-2.5">
          <div className="flex-1 relative rounded-2xl bg-slate-50 border border-slate-300 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100 transition-all">
            <label htmlFor="chat-message-input" className="sr-only">
              Type your symptoms or health message
            </label>
            <textarea
              id="chat-message-input"
              ref={inputRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder(language)}
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none max-h-32 min-h-[48px]"
            />
          </div>

          {/* Voice Input Button */}
          <VoiceInput
            language={language}
            onTranscriptChange={(transcript) => setInputText(transcript)}
            disabled={isLoading}
          />

          {/* Send Button in Light Blue */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            aria-label="Send message"
            className="btn-primary !p-3 shrink-0 rounded-2xl"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-2">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">Enter</kbd> to send · All information is organized for your doctor.
        </p>
      </div>
    </div>
  );
}
