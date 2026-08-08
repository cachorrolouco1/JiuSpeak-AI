/**
 * JiuSpeak AI - Speech To Text Service
 */

import { ISttAdapter, SpeechToTextRequest, SpeechToTextResponse } from './stt.interface';

export class SpeechToTextService {
  constructor(private adapter: ISttAdapter) {}

  getProviderName(): string {
    return this.adapter.getProviderName();
  }

  async transcribeAudio(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
    return this.adapter.speechToText(request);
  }
}
