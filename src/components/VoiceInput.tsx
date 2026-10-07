'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { SpeechHandler, isSpeechRecognitionSupported } from '@/lib/speech';
import { LanguageOption } from '@/lib/types';

interface VoiceInputProps {
  language: LanguageOption;
  onTranscriptChange: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({
  language,
  onTranscriptChange,
  disabled = false,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const speechRef = useRef<SpeechHandler | null>(null);

  useEffect(() => {
    const isSupported = isSpeechRecognitionSupported();
    setSupported(isSupported);
    speechRef.current = new SpeechHandler();
  }, []);

  useEffect(() => {
    if (speechRef.current) {
      speechRef.current.setLanguage(language);
    }
  }, [language]);

  const toggleListening = () => {
    setErrorMessage(null);

    if (!supported || !speechRef.current) {
      setErrorMessage('Voice input is not supported in this browser. You can type your response instead.');
      return;
    }

    if (isListening) {
      speechRef.current.stop();
      setIsListening(false);
    } else {
      const started = speechRef.current.start(
        (interimText) => {
          onTranscriptChange(interimText);
        },
        (finalText) => {
          onTranscriptChange(finalText);
          setIsListening(false);
        },
        (error) => {
          setErrorMessage(error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (started) {
        setIsListening(true);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        aria-pressed={isListening}
        aria-label={isListening ? 'Stop microphone' : 'Start microphone for speech input'}
        className={`relative p-3 rounded-2xl transition-all flex items-center justify-center min-w-[48px] min-h-[48px] ${
          isListening
            ? 'bg-red-600 text-white shadow-md animate-pulse'
            : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Mic className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Floating Status Notification */}
      {isListening && (
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-full bg-white border border-sky-200 text-sky-800 text-xs shadow-lg flex items-center space-x-2 z-30"
        >
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" aria-hidden="true"></span>
          <span className="font-semibold">Listening... Speak at your own pace</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="absolute bottom-full mb-2 right-0 w-72 p-3.5 rounded-2xl bg-white border border-amber-300 text-amber-900 text-xs shadow-xl flex items-start space-x-2 z-30"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs text-slate-500 hover:text-slate-900 underline mt-1.5 block font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
