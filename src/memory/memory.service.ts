/**
 * JiuSpeak AI - Memory Service Implementation
 * Persists Short-Term, Episodic, Learning Errors, and Spaced Repetition in SQL DB
 */

import { IMemoryService } from '../core/interfaces/memory-service.interface';
import { StudentMemoryContext, EpisodicMemoryItem, LearningErrorItem, StudentVocabularyStatus } from '../core/types/memory.types';
import { LayeredContextRetriever } from './context-retriever';
import { dbRepository } from '../db/repository';

export class MemoryService implements IMemoryService {
  private contextRetriever = new LayeredContextRetriever();

  async getStudentMemoryContext(studentId: string, conversationId?: string): Promise<StudentMemoryContext> {
    return this.contextRetriever.buildStudentMemoryContext(studentId, conversationId);
  }

  async addEpisodicMemory(
    studentId: string,
    summary: string,
    keyTakeaway: string,
    bjjScenario: string
  ): Promise<EpisodicMemoryItem> {
    const id = `mem-${Date.now()}`;
    const createdAt = new Date().toISOString();

    await dbRepository.addMemory({
      id,
      studentId,
      memoryType: 'EPISODIC',
      summary,
      keyTakeaway,
      bjjScenario,
      createdAt,
    });

    return {
      id,
      studentId,
      summary,
      keyTakeaway,
      bjjScenario,
      date: createdAt,
    };
  }

  async recordLearningError(
    studentId: string,
    errorPattern: string,
    incorrectSentence: string,
    correctedSentence: string,
    category: string
  ): Promise<LearningErrorItem> {
    const existingErrors = await dbRepository.getLearningErrors(studentId);
    const existing = existingErrors.find((e) => e.errorPattern === errorPattern);

    if (existing) {
      existing.occurrenceCount += 1;
      existing.lastOccurredAt = new Date().toISOString();
      existing.incorrectSentence = incorrectSentence;
      existing.correctedSentence = correctedSentence;
      await dbRepository.saveLearningError(existing);
      return existing;
    }

    const id = `err-${Date.now()}`;
    const newError: LearningErrorItem = {
      id,
      studentId,
      errorPattern,
      incorrectSentence,
      correctedSentence,
      category,
      occurrenceCount: 1,
      lastOccurredAt: new Date().toISOString(),
      resolved: false,
    };

    await dbRepository.saveLearningError(newError);
    return newError;
  }

  async updateVocabularyStatus(studentId: string, termEn: string, scoreDelta: number): Promise<StudentVocabularyStatus> {
    const allVocab = await dbRepository.getAllVocabulary();
    const vocabDef = allVocab.find((v) => v.termEn.toLowerCase() === termEn.toLowerCase());

    const vocabId = vocabDef ? vocabDef.id : `voc-custom-${Date.now()}`;
    const studentVocab = await dbRepository.getStudentVocabulary(studentId);
    let sv = studentVocab.find((v) => v.vocabularyId === vocabId);

    const now = new Date().toISOString();

    if (!sv) {
      sv = {
        id: `sv-${Date.now()}`,
        studentId,
        vocabularyId: vocabId,
        masteryLevel: Math.max(0, Math.min(5, 1 + scoreDelta)),
        mistakeCount: scoreDelta < 0 ? 1 : 0,
        lastReviewedAt: now,
        nextReviewDue: new Date(Date.now() + 86400000).toISOString(),
      };
    } else {
      sv.masteryLevel = Math.max(0, Math.min(5, sv.masteryLevel + scoreDelta));
      if (scoreDelta < 0) sv.mistakeCount += 1;
      sv.lastReviewedAt = now;
      sv.nextReviewDue = new Date(Date.now() + 86400000 * Math.max(1, sv.masteryLevel)).toISOString();
    }

    await dbRepository.saveStudentVocabulary(sv);

    return {
      studentId,
      vocabId,
      termEn,
      masteryLevel: sv.masteryLevel,
      lastReviewedAt: sv.lastReviewedAt,
      nextReviewDue: sv.nextReviewDue,
      mistakeCount: sv.mistakeCount,
    };
  }

  async resolveError(errorId: string): Promise<void> {
    // Look up across errors
    const allErrors = await dbRepository.getLearningErrors('std-carlos-123');
    const err = allErrors.find((e) => e.id === errorId);
    if (err) {
      err.resolved = true;
      await dbRepository.saveLearningError(err);
    }
  }
}
