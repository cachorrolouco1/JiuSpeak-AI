/**
 * JiuSpeak AI - BJJ Educational Error Analyzer
 */

import { MessageEvaluation } from '../core/types/evaluation.types';

export class ErrorAnalyzer {
  analyzeBJJGrammarAndVocab(
    studentId: string,
    messageId: string,
    textInput: string,
    hasAudioInput: boolean,
    audioPronunciationScore: number | null
  ): MessageEvaluation {
    const textLower = textInput.toLowerCase();
    const identifiedErrors: MessageEvaluation['identifiedErrors'] = [];
    const vocabAcquired: string[] = [];
    const vocabStruggled: string[] = [];

    // Rule 1: "since" vs "for" with time durations
    if (textLower.includes('since') && (textLower.includes('years') || textLower.includes('months') || textLower.includes('weeks') || textLower.includes('days'))) {
      identifiedErrors.push({
        type: 'GRAMMAR',
        errorText: textInput,
        correction: textInput.replace(/since/gi, 'for'),
        explanation: 'Para indicar a duração total de tempo de uma ação (ex: 2 anos), utilize "for" em vez de "since". Use "since" apenas para marcar o ponto de início exato (ex: since 2021).',
      });
      vocabStruggled.push('for / since');
    }

    // Rule 2: "train" without continuous tense or BJJ context
    if (textLower.includes('i train bjj since') || textLower.includes('i train bjj for')) {
      identifiedErrors.push({
        type: 'GRAMMAR',
        errorText: textInput,
        correction: 'I have been training BJJ for...',
        explanation: 'Para uma ação do passado que continua no presente (como seus anos de treino de Jiu-Jitsu), a forma mais natural e precisa é o Present Perfect Continuous: "I have been training..."',
      });
      vocabStruggled.push('Present Perfect Continuous');
    }

    // Detect positive BJJ vocabulary used correctly
    if (textLower.includes('knee cut') || textLower.includes('underhook') || textLower.includes('cross collar') || textLower.includes('closed guard')) {
      vocabAcquired.push('BJJ Technical Terminology');
    }

    // Dynamic 6-Dimension Scoring Logic
    const baseGrammar = Math.max(50, 90 - identifiedErrors.filter((e) => e.type === 'GRAMMAR').length * 20);
    const baseVocab = Math.max(50, 85 + vocabAcquired.length * 5 - vocabStruggled.length * 10);
    const baseFluency = Math.min(95, Math.max(60, 70 + (textInput.length > 30 ? 15 : 0)));
    const baseComprehension = 88;
    const baseContext = textLower.includes('bjj') || textLower.includes('guard') || textLower.includes('pass') || textLower.includes('choke') ? 92 : 75;

    // CRITICAL SPEC REQUIREMENT:
    // Pronunciation MUST BE NULL if no real audio input was analyzed!
    const pronunciationScore = hasAudioInput ? (audioPronunciationScore ?? 80) : null;

    return {
      id: `eval-${Date.now()}`,
      studentId,
      messageId,
      scores: {
        grammar: baseGrammar,
        vocabulary: baseVocab,
        fluency: baseFluency,
        comprehension: baseComprehension,
        context: baseContext,
        pronunciation: pronunciationScore,
        confidenceScore: 82,
      },
      identifiedErrors,
      vocabAcquired,
      vocabStruggled,
      pedagogicalAdvice:
        identifiedErrors.length > 0
          ? 'Excelente engajamento no contexto de BJJ! Fique atento às construções temporais para soar ainda mais natural ao conversar com parceiros estrangeiros.'
          : 'Excelente colocação técnica! Sua construção de frase e vocabulário de Jiu-Jitsu estão muito alinhados.',
      evaluatedAt: new Date().toISOString(),
    };
  }
}
