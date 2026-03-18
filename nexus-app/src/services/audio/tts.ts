// NEXUS Native Web Speech API TTS Client

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Load voices asynchronously
      const loadVoices = () => {
        if (this.synth) {
          this.voices = this.synth.getVoices();
        }
      };
      loadVoices();
      if (this.synth && this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = loadVoices;
      }
    } else {
      console.warn('Web Speech API TTS is not supported in this Chromium/Tauri build.');
    }
  }

  public get isSupported(): boolean {
    return this.synth !== null;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public speak(text: string, options?: { pitch?: number; rate?: number; onBoundary?: (e: SpeechSynthesisEvent) => void; onEnd?: () => void }) {
    if (!this.synth) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Default config matching NEXUS aesthetic (slightly deeper, calm)
    utterance.pitch = options?.pitch ?? 0.8; 
    utterance.rate = options?.rate ?? 0.95;
    
    // Try to find a good English voice
    const preferredVoice = this.voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel'));
    if (preferredVoice) utterance.voice = preferredVoice;

    if (options?.onEnd) utterance.onend = options.onEnd;
    if (options?.onBoundary) utterance.onboundary = options.onBoundary;

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const ttsService = new TextToSpeechService();
