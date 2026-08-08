/**
 * JiuSpeak AI - Voice Service & Adapter Contracts (ElevenLabs & Fallback)
 */

import {
  SpeechToTextRequest,
  SpeechToTextResponse,
  TextToSpeechRequest,
  TextToSpeechResponse,
} from '../types/voice.types';

export interface IVoiceAdapter {
  speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse>;
  textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse>;
  getVoiceProviderName(): string;
}

export interface IVoiceService {
  transcribeAudio(request: SpeechToTextRequest): Promise<SpeechToTextResponse>;
  synthesizeSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse>;
}
