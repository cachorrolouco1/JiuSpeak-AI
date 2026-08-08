/**
 * JiuSpeak AI - Text To Speech Interfaces
 */

export interface TextToSpeechRequest {
  text: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

export interface TextToSpeechResponse {
  audioBase64: string;
  audioUrl: string;
  durationSeconds: number;
  voiceProvider: string;
  voiceIdUsed: string;
}

export interface ITtsAdapter {
  getProviderName(): string;
  textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse>;
}
