
export enum TranslationMode {
  HOME = 'HOME',
  LIVE_CAMERA = 'LIVE_CAMERA',
  VIDEO_UPLOAD = 'VIDEO_UPLOAD',
  VIDEO_RESULT = 'VIDEO_RESULT',
  VOICE_TRANSLATE = 'VOICE_TRANSLATE'
}

export interface TranslationLogEntry {
  id: string;
  timestamp: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  timestamp: string;
  sourceLang: string;
  targetLang: string;
  type: 'live' | 'video' | 'voice';
  status: 'Completed' | 'Saved' | 'Processing';
}

export interface OCRResult {
  originalText: string;
  translatedText: string;
  pronunciation?: string;
  confidence: number;
}
