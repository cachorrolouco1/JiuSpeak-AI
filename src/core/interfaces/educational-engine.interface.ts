/**
 * JiuSpeak AI - Educational Engine Contracts (6 Dimensions: Grammar, Vocabulary, Fluency, Comprehension, Context, Pronunciation [nullable])
 */

import { StudentProgress, DimensionScores } from '../types/student.types';
import { ComprehensiveEvaluationRequest, ComprehensiveEvaluationResponse } from '../types/evaluation.types';

export interface IEducationalEngine {
  evaluateStudentPerformance(request: ComprehensiveEvaluationRequest): Promise<ComprehensiveEvaluationResponse>;
  getStudentProgress(studentId: string): Promise<StudentProgress>;
  calculateOverallScore(scores: DimensionScores): number;
  generateRecommendedDrills(studentId: string): Promise<string[]>;
}
