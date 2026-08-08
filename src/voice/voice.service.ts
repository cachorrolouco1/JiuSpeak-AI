/**
 * JiuSpeak AI - Voice Service Facade
 * Composes independent STT and TTS services
 */

import { SpeechToTextService } from './stt/stt.service';
import { TextToSpeechService } from './tts/tts.service';
import { SpeechToTextRequest, SpeechToTextResponse } from './stt/stt.interface';
import { TextToSpeechRequest, TextToSpeechResponse } from './tts/tts.interface';

export class VoiceService {
  constructor(
    private sttService: SpeechToTextService,
    private ttsService: TextToSpeechService
  ) {}

  async transcribeAudio(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
    return this.sttService.transcribeAudio(request);
  }

  async synthesizeSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    return this.ttsService.synthesizeSpeech(request);
  }

  getProviderName(): string {
    return `STT: [${this.sttService.getProviderName()}] | TTS: [${this.ttsService.getProviderName()}]`;
  }
}
