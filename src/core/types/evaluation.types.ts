/**
 * JiuSpeak AI - Educational Evaluation Types
 */

import { DimensionScores } from './student.types';

export interface MessageEvaluation {
  id: string;
  studentId: string;
  messageId: string;
  scores: DimensionScores;
  identifiedErrors: Array<{
    type: 'GRAMMAR' | 'VOCABULARY' | 'PRONUNCIATION' | 'BJJ_EXPRESSION';
    errorText: string;
    correction: string;
    explanation: string;
  }>;
  vocabAcquired: string[];
  vocabStruggled: string[];
  pedagogicalAdvice: string;
  evaluatedAt: string;
}

export interface ComprehensiveEvaluationRequest {
  studentId: string;
  conversationId?: string;
  textInput: string;
  audioInputBase64?: string;
  bjjContext?: string;
}

export interface ComprehensiveEvaluationResponse {
  evaluation: MessageEvaluation;
  updatedOverallScores: DimensionScores;
  recommendations: string[];
}
