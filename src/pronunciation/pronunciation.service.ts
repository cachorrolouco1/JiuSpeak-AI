/**
 * JiuSpeak AI - Pronunciation Service Orchestrator
 */

import { IPronunciationService, IPronunciationAdapter } from '../core/interfaces/pronunciation.interface';
import {
  PronunciationAnalysisRequest,
  PronunciationAnalysisResponse,
} from '../core/types/pronunciation.types';

export class PronunciationService implements IPronunciationService {
  constructor(private adapter: IPronunciationAdapter) {}

  async evaluatePronunciation(
    request: PronunciationAnalysisRequest
  ): Promise<PronunciationAnalysisResponse> {
    return this.adapter.analyzeAcousticPronunciation(request);
  }
}
