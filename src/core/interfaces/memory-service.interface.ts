/**
 * JiuSpeak AI - Memory Service Contracts
 */

import {
  StudentMemoryContext,
  EpisodicMemoryItem,
  LearningErrorItem,
  StudentVocabularyStatus,
} from '../types/memory.types';

export interface IMemoryService {
  getStudentMemoryContext(studentId: string, conversationId?: string): Promise<StudentMemoryContext>;
  addEpisodicMemory(studentId: string, summary: string, keyTakeaway: string, bjjScenario: string): Promise<EpisodicMemoryItem>;
  recordLearningError(studentId: string, errorPattern: string, incorrectSentence: string, correctedSentence: string, category: string): Promise<LearningErrorItem>;
  updateVocabularyStatus(studentId: string, termEn: string, scoreDelta: number): Promise<StudentVocabularyStatus>;
  resolveError(errorId: string): Promise<void>;
}
