/**
 * JiuSpeak AI - Pronunciation Analysis Types
 */

export interface PhoneticWordEvaluation {
  word: string;
  phoneticSpelling: string;
  phoneticAccuracyScore: number; // 0 - 100
  isMispronounced: boolean;
  expectedPronunciation: string;
  actualPronunciation?: string;
  feedbackAdvicePt?: string;
}

export interface PronunciationAnalysisRequest {
  audioBase64: string;
  expectedText: string;
  language?: string;
}

export interface PronunciationAnalysisResponse {
  isAudioAnalyzed: boolean; // MUST BE TRUE ONLY WHEN REAL AUDIO WAS ANALYZED
  overallPronunciationScore: number | null; // null if no real audio
  words: PhoneticWordEvaluation[];
  acousticMetrics?: {
    pitchStability: number;
    articulationRate: number;
    clarityScore: number;
  };
  summaryAdvicePt: string;
}
