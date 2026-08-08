/**
 * JiuSpeak AI - Pronunciation Service & Adapter Contracts
 */

import {
  PronunciationAnalysisRequest,
  PronunciationAnalysisResponse,
} from '../types/pronunciation.types';

export interface IPronunciationAdapter {
  analyzeAcousticPronunciation(
    request: PronunciationAnalysisRequest
  ): Promise<PronunciationAnalysisResponse>;
}

export interface IPronunciationService {
  evaluatePronunciation(
    request: PronunciationAnalysisRequest
  ): Promise<PronunciationAnalysisResponse>;
}
