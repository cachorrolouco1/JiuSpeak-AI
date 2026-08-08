/**
 * JiuSpeak AI - Text To Speech Service
 */

import { ITtsAdapter, TextToSpeechRequest, TextToSpeechResponse } from './tts.interface';

export class TextToSpeechService {
  constructor(private adapter: ITtsAdapter) {}

  getProviderName(): string {
    return this.adapter.getProviderName();
  }

  async synthesizeSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    return this.adapter.textToSpeech(request);
  }
}
