/**
 * JiuSpeak AI - Speech To Text Interfaces
 */

export interface SpeechToTextRequest {
  audioBase64: string;
  mimeType?: string;
  language?: string;
}

export interface SpeechToTextResponse {
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  durationSeconds: number;
  provider: string;
}

export interface ISttAdapter {
  getProviderName(): string;
  speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse>;
}
