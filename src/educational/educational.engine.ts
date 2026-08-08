/**
 * JiuSpeak AI - Educational Engine Orchestrator
 * Evaluates performance across 6 dimensions: Grammar, Vocabulary, Fluency, Comprehension, Context, Pronunciation (nullable)
 */

import { IEducationalEngine } from '../core/interfaces/educational-engine.interface';
import { StudentProgress, DimensionScores } from '../core/types/student.types';
import { ComprehensiveEvaluationRequest, ComprehensiveEvaluationResponse } from '../core/types/evaluation.types';
import { ErrorAnalyzer } from './error-analyzer';
import { dbRepository } from '../db/repository';

export class EducationalEngine implements IEducationalEngine {
  private errorAnalyzer = new ErrorAnalyzer();

  async evaluateStudentPerformance(
    request: ComprehensiveEvaluationRequest
  ): Promise<ComprehensiveEvaluationResponse> {
    const hasAudio = !!request.audioInputBase64;
    const evaluation = this.errorAnalyzer.analyzeBJJGrammarAndVocab(
      request.studentId,
      `msg-${Date.now()}`,
      request.textInput,
      hasAudio,
      null
    );

    // Update overall progress
    const updatedProgress = await this.getStudentProgress(request.studentId);

    return {
      evaluation,
      updatedOverallScores: updatedProgress.scores,
      recommendations: updatedProgress.recommendedRevisions,
    };
  }

  calculateOverallScore(scores: DimensionScores): number {
    // If pronunciation is null, average across the remaining 5 dimensions
    if (scores.pronunciation === null) {
      return Math.round(
        (scores.grammar + scores.vocabulary + scores.fluency + scores.comprehension + scores.context) / 5
      );
    }
    return Math.round(
      (scores.grammar + scores.vocabulary + scores.fluency + scores.comprehension + scores.context + scores.pronunciation) / 6
    );
  }

  async getStudentProgress(studentId: string): Promise<StudentProgress> {
    const dbProg = (await dbRepository.getStudentProgress(studentId)) || {
      id: `prog-${studentId}`,
      studentId,
      overallScore: 78,
      grammarScore: 74,
      vocabularyScore: 88,
      fluencyScore: 72,
      comprehensionScore: 85,
      contextScore: 90,
      pronunciationScore: null,
      confidenceScore: 80,
      strengthsJson: JSON.stringify(['Vocabulário de Passagens', 'Comando de Árbitro']),
      weaknessesJson: JSON.stringify(['Uso de Since vs For']),
      recommendationsJson: JSON.stringify(['Praticar simulações de drilling']),
      updatedAt: new Date().toISOString(),
    };

    const scores: DimensionScores = {
      grammar: dbProg.grammarScore,
      vocabulary: dbProg.vocabularyScore,
      fluency: dbProg.fluencyScore,
      comprehension: dbProg.comprehensionScore,
      context: dbProg.contextScore,
      pronunciation: dbProg.pronunciationScore,
      confidenceScore: dbProg.confidenceScore,
    };

    const overallScore = this.calculateOverallScore(scores);
    const errors = await dbRepository.getLearningErrors(studentId);

    return {
      studentId,
      currentLevel: 'Intermediate',
      overallScore,
      scores,
      masteredVocabCount: 18,
      strugglingVocabCount: 3,
      activeErrorsCount: errors.filter((e) => !e.resolved).length,
      strengths: JSON.parse(dbProg.strengthsJson),
      weaknesses: JSON.parse(dbProg.weaknessesJson),
      recommendedRevisions: JSON.parse(dbProg.recommendationsJson),
      lastEvaluatedAt: dbProg.updatedAt,
    };
  }

  async generateRecommendedDrills(studentId: string): Promise<string[]> {
    return [
      'Simulação de instrução de armlock na guarda fechada em inglês',
      'Treino de resposta aos comandos do árbitro da IBJJF',
      'Exercício de correção temporal: Present Perfect Continuous em conversas de dojo',
    ];
  }
}
