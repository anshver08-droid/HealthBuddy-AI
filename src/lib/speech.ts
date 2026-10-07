// Web Speech API interface definitions for TypeScript
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindow;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export class SpeechHandler {
  private recognition: any = null;
  private isListening: boolean = false;
  private language: string = 'en-IN';

  constructor(lang: string = 'en-IN') {
    this.language = lang;
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.language;
      }
    }
  }

  public setLanguage(langOption: string) {
    const map: Record<string, string> = {
      'English':  'en-US',
      'Hindi':    'hi-IN',
      'Hinglish': 'en-IN', // Indian English handles Hinglish phonetics best
      'Spanish':  'es-ES',
      'Tamil':    'ta-IN',
      'Bengali':  'bn-IN',
      'Marathi':  'mr-IN',
      'Telugu':   'te-IN',
    };
    this.language = map[langOption] ?? 'en-US';
    if (this.recognition) {
      this.recognition.lang = this.language;
    }
  }

  public start(
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Voice input is currently unavailable. You can continue using text.');
      return false;
    }

    try {
      this.recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        if (finalText) {
          onFinal(finalText);
        } else if (interimText) {
          onInterim(interimText);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        this.isListening = false;
        onError(
          event.error === 'not-allowed'
            ? 'Microphone permission denied. You can continue using text.'
            : 'Voice input error. You can continue typing.'
        );
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      this.isListening = false;
      onError('Voice input is currently unavailable. You can continue using text.');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Speech stop error:', e);
      }
      this.isListening = false;
    }
  }

  public getListeningState(): boolean {
    return this.isListening;
  }
}
