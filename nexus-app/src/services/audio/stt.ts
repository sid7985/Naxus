// NEXUS Native Web Speech API STT Client
export interface STTEventMap {
  'start': () => void;
  'end': () => void;
  'result': (text: string, isFinal: boolean) => void;
  'error': (err: string) => void;
}

export class SpeechToTextService {
  private recognition: any | null = null;
  private isListening: boolean = false;
  private listeners: { [K in keyof STTEventMap]?: STTEventMap[K][] } = {};

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.emit('start');
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.emit('end');
        };

        this.recognition.onerror = (event: any) => {
          this.isListening = false;
          this.emit('error', event.error);
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript.trim() !== '') {
            this.emit('result', finalTranscript.trim(), true);
          } else if (interimTranscript.trim() !== '') {
            this.emit('result', interimTranscript.trim(), false);
          }
        };
      } else {
        console.warn('Web Speech API is not supported in this Chromium/Tauri build.');
      }
    }
  }

  public on<K extends keyof STTEventMap>(event: K, callback: STTEventMap[K]) {
    if (!this.listeners[event]) {
      this.listeners[event] = [] as any;
    }
    const arr = this.listeners[event] as Function[];
    arr.push(callback as Function);
  }

  public off<K extends keyof STTEventMap>(event: K, callback: STTEventMap[K]) {
    if (this.listeners[event]) {
      const filtered = (this.listeners[event] as Function[]).filter(cb => cb !== callback);
      this.listeners[event] = filtered as any;
    }
  }

  private emit<K extends keyof STTEventMap>(event: K, ...args: Parameters<STTEventMap[K]>) {
    const arr = this.listeners[event] as Function[] | undefined;
    arr?.forEach(cb => cb(...args));
  }

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Failed to start speech recognition', e);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public get isSupported(): boolean {
    return this.recognition !== null;
  }
}

export const sttService = new SpeechToTextService();
