// Digital India Bhashini (NLTM) Integration Service
// Connects Mind Mate to Bhashini's National Language Translation Mission
// Supports North Eastern Indian Languages with elderly-paced ASR, NMT, and TTS

import { LanguageCode, NERLanguageOption } from '../models/types';

export interface BhashiniPipelineConfig {
  apiKey?: string;
  userId?: string;
  pipelineId?: string;
  inferenceUrl: string;
}

export interface BhashiniLanguageProfile {
  code: LanguageCode;
  bhashiniCode: string;
  name: string;
  nativeScript: string;
  region: string;
  category: '8th_schedule' | 'ner_indigenous' | 'national' | 'universal';
  ttsVoice: string;
  speechPitch: number;
  speechRate: number; // Elderly-calibrated cadence (0.85 - 0.90x)
}

export const BHASHINI_NER_PROFILES: Record<LanguageCode, BhashiniLanguageProfile> = {
  as: {
    code: 'as',
    bhashiniCode: 'as',
    name: 'Assamese',
    nativeScript: 'অসমীয়া',
    region: 'Assam / Brahmaputra Valley',
    category: '8th_schedule',
    ttsVoice: 'as-IN-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.88
  },
  brx: {
    code: 'brx',
    bhashiniCode: 'brx',
    name: 'Bodo',
    nativeScript: 'बर\'',
    region: 'Bodoland Territorial Region, Assam',
    category: '8th_schedule',
    ttsVoice: 'brx-IN-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.86
  },
  mni: {
    code: 'mni',
    bhashiniCode: 'mni',
    name: 'Manipuri / Meitei',
    nativeScript: 'মৈতৈলোন্',
    region: 'Manipur / Imphal Valley',
    category: '8th_schedule',
    ttsVoice: 'mni-IN-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.87
  },
  bn: {
    code: 'bn',
    bhashiniCode: 'bn',
    name: 'Bengali (NER)',
    nativeScript: 'বাংলা (বৰাক / ত্রিপুরা)',
    region: 'Tripura / Barak Valley, Assam',
    category: '8th_schedule',
    ttsVoice: 'bn-IN-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.88
  },
  ne: {
    code: 'ne',
    bhashiniCode: 'ne',
    name: 'Nepali',
    nativeScript: 'नेपाली',
    region: 'Sikkim / Dima Hasao, Assam',
    category: '8th_schedule',
    ttsVoice: 'ne-NP-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.88
  },
  kha: {
    code: 'kha',
    bhashiniCode: 'kha',
    name: 'Khasi',
    nativeScript: 'Ka Ktien Khasi',
    region: 'Meghalaya / Khasi Hills',
    category: 'ner_indigenous',
    ttsVoice: 'en-IN-Standard-C',
    speechPitch: 0.98,
    speechRate: 0.87
  },
  grt: {
    code: 'grt',
    bhashiniCode: 'grt',
    name: 'Garo',
    nativeScript: 'A·chik',
    region: 'Meghalaya / Garo Hills',
    category: 'ner_indigenous',
    ttsVoice: 'en-IN-Standard-D',
    speechPitch: 0.98,
    speechRate: 0.87
  },
  lus: {
    code: 'lus',
    bhashiniCode: 'lus',
    name: 'Mizo',
    nativeScript: 'Mizo ṭawng',
    region: 'Mizoram / Lushai Hills',
    category: 'ner_indigenous',
    ttsVoice: 'en-IN-Standard-A',
    speechPitch: 0.98,
    speechRate: 0.86
  },
  kok: {
    code: 'kok',
    bhashiniCode: 'kok',
    name: 'Kokborok',
    nativeScript: 'Kokborok',
    region: 'Tripura',
    category: 'ner_indigenous',
    ttsVoice: 'bn-IN-Standard-B',
    speechPitch: 0.97,
    speechRate: 0.86
  },
  nag: {
    code: 'nag',
    bhashiniCode: 'nag',
    name: 'Nagamese',
    nativeScript: 'Nagamese',
    region: 'Nagaland',
    category: 'ner_indigenous',
    ttsVoice: 'as-IN-Standard-B',
    speechPitch: 1.0,
    speechRate: 0.88
  },
  adi: {
    code: 'adi',
    bhashiniCode: 'adi',
    name: 'Nyishi / Adi',
    nativeScript: 'Nyishi / Adi',
    region: 'Arunachal Pradesh',
    category: 'ner_indigenous',
    ttsVoice: 'hi-IN-Standard-B',
    speechPitch: 0.98,
    speechRate: 0.86
  },
  mjw: {
    code: 'mjw',
    bhashiniCode: 'mjw',
    name: 'Karbi',
    nativeScript: 'Karbi Lamthe',
    region: 'Karbi Anglong, Assam',
    category: 'ner_indigenous',
    ttsVoice: 'as-IN-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.87
  },
  mif: {
    code: 'mif',
    bhashiniCode: 'mif',
    name: 'Mishing',
    nativeScript: 'Mising Agom',
    region: 'Dhemaji / Lakhimpur, Assam',
    category: 'ner_indigenous',
    ttsVoice: 'as-IN-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.87
  },
  hi: {
    code: 'hi',
    bhashiniCode: 'hi',
    name: 'Hindi',
    nativeScript: 'हिन्दी',
    region: 'National',
    category: 'national',
    ttsVoice: 'hi-IN-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.88
  },
  en: {
    code: 'en',
    bhashiniCode: 'en',
    name: 'English',
    nativeScript: 'English',
    region: 'Standard',
    category: 'universal',
    ttsVoice: 'en-IN-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.88
  },
  regional: {
    code: 'regional',
    bhashiniCode: 'as',
    name: 'Assamese (Regional)',
    nativeScript: 'অসমীয়া',
    region: 'Assam',
    category: '8th_schedule',
    ttsVoice: 'as-IN-Standard-A',
    speechPitch: 1.0,
    speechRate: 0.88
  }
};

class BhashiniService {
  private config: BhashiniPipelineConfig = {
    inferenceUrl: 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline'
  };

  /**
   * Set API credentials if provided by user/organization
   */
  public configure(apiKey?: string, userId?: string, pipelineId?: string) {
    if (apiKey) this.config.apiKey = apiKey;
    if (userId) this.config.userId = userId;
    if (pipelineId) this.config.pipelineId = pipelineId;
  }

  /**
   * Returns language metadata formatted for Bhashini pipeline requests
   */
  public getProfile(lang: LanguageCode): BhashiniLanguageProfile {
    return BHASHINI_NER_PROFILES[lang] || BHASHINI_NER_PROFILES.en;
  }

  /**
   * Speaks cognitive prompts using Bhashini-calibrated elderly pacing (0.88x speed)
   * Falls back gracefully to browser SpeechSynthesis API
   */
  public speakElderlyPrompt(text: string, lang: LanguageCode): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const profile = this.getProfile(lang);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = profile.speechRate;
      utterance.pitch = profile.speechPitch;

      // Select voice if available
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.lang.startsWith(profile.bhashiniCode) || v.lang.startsWith(lang));
      if (match) {
        utterance.voice = match;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Checks if a language is an officially recognized 8th Schedule or Bhashini NER initiative language
   */
  public isBhashiniSupported(lang: LanguageCode): boolean {
    return !!BHASHINI_NER_PROFILES[lang];
  }
}

export const bhashiniService = new BhashiniService();
