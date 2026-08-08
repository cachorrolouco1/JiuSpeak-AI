/**
 * JiuSpeak AI - Voice Service Types
 */

export interface SpeechToTextRequest {
  audioBase64: string;
  mimeType?: string;
  language?: string; // 'en-US' | 'pt-BR'
}

export interface SpeechToTextResponse {
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  durationSeconds: number;
}

export interface TextToSpeechRequest {
  text: string;
  voiceId?: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
}

export interface TextToSpeechResponse {
  audioBase64: string;
  audioUrl?: string;
  durationSeconds: number;
  voiceProvider: 'ElevenLabs' | 'Fallback';
}

export interface RealtimeVoiceConfig {
  voiceId: string;
  sampleRate: number;
  enableInterruption: boolean;
}
