/**
 * JiuSpeak AI - Layered Context Retriever
 * Assembles Short-Term, Episodic/Performance, and Semantic/Vocabulary memories from SQL Database
 */

import { StudentMemoryContext, EpisodicMemoryItem, LearningErrorItem, StudentVocabularyStatus } from '../core/types/memory.types';
import { dbRepository } from '../db/repository';

export class LayeredContextRetriever {
  async buildStudentMemoryContext(studentId: string, conversationId?: string): Promise<StudentMemoryContext> {
    const profile = (await dbRepository.getStudentProfile(studentId)) || {
      id: studentId,
      userId: 'usr-default',
      name: 'Carlos "Grip" Silva',
      email: 'carlos.bjj@jiuspeak.com',
      bjjBelt: 'Blue' as const,
      bjjStripes: 2,
      academyName: 'JiuSpeak Academy',
      englishLevel: 'Intermediate' as const,
      primaryObjective: 'Aprender inglês técnico de Jiu-Jitsu',
      preferredAvatarId: 'prof-jiuspeak-master',
      totalConversations: 1,
      totalExercisesCompleted: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Fetch Short-Term Messages
    const recentMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }> = [];
    if (conversationId) {
      const msgs = await dbRepository.getMessagesByConversation(conversationId);
      msgs.slice(-10).forEach((m) => {
        if (m.role === 'user' || m.role === 'assistant') {
          recentMessages.push({
            role: m.role,
            content: m.content,
            timestamp: m.createdAt,
          });
        }
      });
    }

    // 2. Fetch Episodic Memories
    const dbMems = await dbRepository.getMemories(studentId);
    const recentEpisodicMemories: EpisodicMemoryItem[] = dbMems
      .filter((m) => m.memoryType === 'EPISODIC')
      .map((m) => ({
        id: m.id,
        studentId: m.studentId,
        summary: m.summary,
        keyTakeaway: m.keyTakeaway,
        bjjScenario: m.bjjScenario,
        date: m.createdAt,
      }));

    // 3. Fetch Active Learning Errors
    const dbErrs = await dbRepository.getLearningErrors(studentId);
    const activeErrors: LearningErrorItem[] = dbErrs
      .filter((e) => !e.resolved)
      .map((e) => ({
        id: e.id,
        studentId: e.studentId,
        errorPattern: e.errorPattern,
        incorrectSentence: e.incorrectSentence,
        correctedSentence: e.correctedSentence,
        category: e.category,
        occurrenceCount: e.occurrenceCount,
        lastOccurredAt: e.lastOccurredAt,
        resolved: e.resolved,
      }));

    // 4. Fetch Priority Vocabulary for Spaced Repetition Review
    const allVocab = await dbRepository.getAllVocabulary();
    const studentVocab = await dbRepository.getStudentVocabulary(studentId);

    const priorityVocabToReview: StudentVocabularyStatus[] = studentVocab
      .map((sv) => {
        const vocabDef = allVocab.find((v) => v.id === sv.vocabularyId);
        return {
          studentId: sv.studentId,
          vocabId: sv.vocabularyId,
          termEn: vocabDef ? vocabDef.termEn : 'BJJ Term',
          masteryLevel: sv.masteryLevel,
          lastReviewedAt: sv.lastReviewedAt,
          nextReviewDue: sv.nextReviewDue,
          mistakeCount: sv.mistakeCount,
        };
      })
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, 5);

    return {
      studentId: profile.id,
      studentName: profile.name || 'Aluno JiuSpeak',
      bjjBelt: profile.bjjBelt,
      englishLevel: profile.englishLevel,
      shortTermMemory: {
        conversationId: conversationId || 'conv-active',
        recentMessages,
      },
      recentEpisodicMemories,
      activeErrors,
      priorityVocabToReview,
    };
  }
}
