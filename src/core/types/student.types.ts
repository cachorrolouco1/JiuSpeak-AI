/**
 * JiuSpeak AI - Student Domain Types
 */

export type BJJBelt = 'White' | 'Blue' | 'Purple' | 'Brown' | 'Black';

export type EnglishLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced';

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bjjBelt: BJJBelt;
  bjjStripes: number; // 0 to 4
  academyName?: string;
  englishLevel: EnglishLevel;
  primaryObjective: string; // e.g., "Teaching seminars abroad", "Competing at IBJJF Worlds", "Understanding professor's instructions in USA"
  preferredAvatarId: string;
  joinedAt: string;
  lastActiveAt: string;
  totalConversations: number;
  totalExercisesCompleted: number;
  currentModuleId?: string;
}

export interface DimensionScores {
  grammar: number;       // 0 - 100
  vocabulary: number;    // 0 - 100
  fluency: number;       // 0 - 100
  comprehension: number; // 0 - 100
  context: number;       // 0 - 100
  pronunciation: number | null; // null if text-only session, 0-100 if audio evaluated
  confidenceScore: number; // Complementary metric 0 - 100
}

export interface StudentProgress {
  studentId: string;
  currentLevel: EnglishLevel;
  overallScore: number;
  scores: DimensionScores;
  masteredVocabCount: number;
  strugglingVocabCount: number;
  activeErrorsCount: number;
  strengths: string[];
  weaknesses: string[];
  recommendedRevisions: string[];
  lastEvaluatedAt: string;
}
