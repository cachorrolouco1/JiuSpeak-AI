/**
 * JiuSpeak AI - Acoustic Pronunciation Adapter
 * Strictly returns null for acoustic scores when audio is absent or when an acoustic phonetic analyzer hardware module is unconfigured.
 * NO simulated or randomized fake scores!
 */

import { IPronunciationAdapter } from '../core/interfaces/pronunciation.interface';
import {
  PronunciationAnalysisRequest,
  PronunciationAnalysisResponse,
} from '../core/types/pronunciation.types';

export class PronunciationAdapter implements IPronunciationAdapter {
  private hasAcousticAnalyzerHardware = false; // Unconfigured external acoustic hardware analyzer

  async analyzeAcousticPronunciation(
    request: PronunciationAnalysisRequest
  ): Promise<PronunciationAnalysisResponse> {
    // 1. If no audio base64 is provided, pronunciation score MUST be null
    if (!request.audioBase64 || request.audioBase64.trim() === '') {
      return {
        isAudioAnalyzed: false,
        overallPronunciationScore: null,
        words: [],
        summaryAdvicePt: 'Nenhum áudio foi fornecido. A avaliação de pronúncia acústica exige uma gravação de voz.',
      };
    }

    // 2. If audio is provided but real acoustic phonetic analyzer hardware is not configured, return null without fake numbers
    if (!this.hasAcousticAnalyzerHardware) {
      return {
        isAudioAnalyzed: false,
        overallPronunciationScore: null,
        words: [],
        summaryAdvicePt: 'Áudio recebido com sucesso. A análise fonética acústica detalhada requer integração com analisador fonético externo (Dependência Externa Unconfigured).',
      };
    }

    return {
      isAudioAnalyzed: false,
      overallPronunciationScore: null,
      words: [],
      summaryAdvicePt: 'Aguardando módulo fonético.',
    };
  }
}
