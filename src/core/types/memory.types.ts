/**
 * JiuSpeak AI - Layered Memory System Types
 */

export interface ShortTermMemory {
  conversationId: string;
  recentMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export interface EpisodicMemoryItem {
  id: string;
  studentId: string;
  summary: string;
  keyTakeaway: string;
  bjjScenario: string;
  date: string;
}

export interface LearningErrorItem {
  id: string;
  studentId: string;
  errorPattern: string; // e.g., "Using 'since' instead of 'for' with duration"
  incorrectSentence: string;
  correctedSentence: string;
  category: string;
  occurrenceCount: number;
  lastOccurredAt: string;
  resolved: boolean;
}

export interface VocabularyItem {
  id: string;
  termEn: string;
  translationPt: string;
  bjjCategory: 'POSITIONS' | 'SUBMISSIONS' | 'PASSING' | 'GUARD' | 'COMMANDS' | 'COMPETITION' | 'GENERAL';
  definitionPt: string;
  exampleSentenceEn: string;
  audioPronunciationUrl?: string;
  isOfficialJiuSpeakContent: boolean;
}

export interface StudentVocabularyStatus {
  studentId: string;
  vocabId: string;
  termEn: string;
  masteryLevel: number; // 0 (new) to 5 (mastered)
  lastReviewedAt: string;
  nextReviewDue: string; // Spaced repetition timestamp
  mistakeCount: number;
}

export interface StudentMemoryContext {
  studentId: string;
  studentName: string;
  bjjBelt: string;
  englishLevel: string;
  shortTermMemory: ShortTermMemory;
  recentEpisodicMemories: EpisodicMemoryItem[];
  activeErrors: LearningErrorItem[];
  priorityVocabToReview: StudentVocabularyStatus[];
}
