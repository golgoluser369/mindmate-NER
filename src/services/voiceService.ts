import { LanguageCode, NER_LANGUAGES } from '../models/types';

class VoiceService {
  private isSpeaking: boolean = false;

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Returns standard BCP-47 language tag for TTS & Speech Recognition
   * Based on NER_LANGUAGES mapping for North Eastern & Indian languages
   */
  public getSpeechLangTag(lang: LanguageCode): string {
    if (lang === 'regional' || lang === 'as') {
      return 'as-IN';
    }
    const match = NER_LANGUAGES.find(l => l.code === lang);
    if (match && match.ttsTag) {
      return match.ttsTag;
    }
    return 'en-IN';
  }

  /**
   * Returns human-readable label and native name for active language
   */
  public getLanguageVoiceMeta(lang: LanguageCode) {
    if (lang === 'regional') {
      return { label: 'Assamese', nativeName: 'অসমীয়া', ttsTag: 'as-IN' };
    }
    const match = NER_LANGUAGES.find(l => l.code === lang);
    return match || { label: 'English', nativeName: 'English', ttsTag: 'en-IN' };
  }

  /**
   * Finds the most culturally and phonetically appropriate synthesizer voice available in the browser
   */
  private findBestVoice(targetTag: string): SpeechSynthesisVoice | null {
    if (!this.isSpeechSynthesisSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const lowerTag = targetTag.toLowerCase();
    const baseCode = lowerTag.split('-')[0];

    // 1. Direct exact tag match (e.g. 'hi-in', 'bn-in', 'as-in', 'ne-np', 'en-in')
    let matched = voices.find(v => v.lang.toLowerCase() === lowerTag);
    if (matched) return matched;

    // 2. Base language prefix match (e.g. 'bn', 'hi', 'ne', 'en')
    matched = voices.find(v => v.lang.toLowerCase().startsWith(baseCode));
    if (matched) return matched;

    // 3. Phonetic & Script proximity fallback for North Eastern languages:
    // Assamese, Manipuri, Kokborok share Bengali-Assamese Brahmic phonetics
    if (baseCode === 'as' || baseCode === 'mni' || baseCode === 'kok') {
      matched = voices.find(v => v.lang.toLowerCase().startsWith('bn'));
      if (matched) return matched;
    }

    // Bodo, Adi, Nepali share Devanagari phonetics
    if (baseCode === 'brx' || baseCode === 'adi' || baseCode === 'ne') {
      matched = voices.find(v => v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase().startsWith('ne'));
      if (matched) return matched;
    }

    // 4. Any Indian English or Indian-accented voice
    matched = voices.find(v => v.lang.toLowerCase().includes('in'));
    if (matched) return matched;

    // 5. Default browser voice
    return voices.find(v => v.default) || voices[0] || null;
  }

  /**
   * Reads text aloud using browser SpeechSynthesis with appropriate language tag and voice
   */
  public speakText(text: string, lang: LanguageCode = 'en', onEnd?: () => void) {
    if (!this.isSpeechSynthesisSupported()) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      const targetTag = this.getSpeechLangTag(lang);
      utterance.lang = targetTag;

      // Select matching voice if available
      const bestVoice = this.findBestVoice(targetTag);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.rate = 0.88; // Gentle, clear pacing for elderly ears
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  public speak(text: string, lang: LanguageCode = 'en', onEnd?: () => void) {
    this.speakText(text, lang, onEnd);
  }

  public stopSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Listens for speech input and invokes onResult callback with recognized text
   * Handles regional speech recognition tag fallback gracefully
   */
  public startListening(
    lang: LanguageCode, 
    onResult: (transcript: string) => void,
    onError?: (errorMsg: string) => void,
    onEnd?: () => void
  ): { stop: () => void } {
    if (!this.isSpeechRecognitionSupported()) {
      if (onError) onError('Speech recognition not supported in this browser.');
      if (onEnd) onEnd();
      return { stop: () => {} };
    }

    try {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();

      recognition.continuous = false;
      recognition.interimResults = false;
      
      const primaryTag = this.getSpeechLangTag(lang);
      recognition.lang = primaryTag;

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn(`Speech recognition error (${primaryTag}):`, event.error);
        
        // If the browser rejects less-common regional tags like as-IN, try fallback to related script tag
        if (event.error === 'language-not-supported') {
          if (primaryTag.startsWith('as') || primaryTag.startsWith('mni')) {
            try {
              recognition.lang = 'bn-IN';
              recognition.start();
              return;
            } catch (retryErr) {
              // ignore
            }
          } else if (primaryTag.startsWith('brx') || primaryTag.startsWith('ne')) {
            try {
              recognition.lang = 'hi-IN';
              recognition.start();
              return;
            } catch (retryErr) {
              // ignore
            }
          }
        }

        if (onError) onError(event.error || 'Audio capture error');
      };

      recognition.onend = () => {
        if (onEnd) onEnd();
      };

      recognition.start();

      return {
        stop: () => {
          try {
            recognition.stop();
          } catch (e) {
            // ignore
          }
        }
      };
    } catch (e: any) {
      if (onError) onError(e.message || 'Speech initialization failed');
      if (onEnd) onEnd();
      return { stop: () => {} };
    }
  }
}

export const voiceService = new VoiceService();
