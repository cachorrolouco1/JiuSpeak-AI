import { StudentMemoryContext, EpisodicMemoryItem, LearningErrorItem, StudentVocabularyStatus } from '../core/types/memory.types';
import { dbRepository } from '../db/repository';
import { queryOne } from '../db/pg-db';

export class LayeredContextRetriever {
  async buildStudentMemoryContext(studentId: string, conversationId?: string): Promise<StudentMemoryContext> {
    // Try SQLite profile first, then PostgreSQL User table
    let profile = await dbRepository.getStudentProfile(studentId);

    if (!profile) {
      try {
        const pgUser = await queryOne('SELECT id, name, belt, stripes, xp, level, academy, city FROM "User" WHERE id = $1', [studentId]);
        if (pgUser) {
          profile = {
            id: pgUser.id, userId: pgUser.id,
            name: pgUser.name || 'Aluno JiuSpeak',
            email: '',
            bjjBelt: (pgUser.belt || 'White') as any,
            bjjStripes: pgUser.stripes || 0,
            academyName: pgUser.academy || '',
            englishLevel: 'Beginner' as const,
            primaryObjective: 'Aprender ingles tecnico de Jiu-Jitsu',
            preferredAvatarId: 'prof-jiuspeak-master',
            totalConversations: 0, totalExercisesCompleted: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      } catch (e) { console.warn('PG profile fetch failed:', e); }
    }

    if (!profile) {
      profile = {
        id: studentId, userId: 'usr-default',
        name: 'Aluno JiuSpeak', email: '',
        bjjBelt: 'White' as const, bjjStripes: 0,
        academyName: '', englishLevel: 'Beginner' as const,
        primaryObjective: 'Aprender ingles tecnico de Jiu-Jitsu',
        preferredAvatarId: 'prof-jiuspeak-master',
        totalConversations: 0, totalExercisesCompleted: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Short-Term Messages
    const recentMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }> = [];
    if (conversationId) {
      const msgs = await dbRepository.getMessagesByConversation(conversationId);
      msgs.slice(-10).forEach((m) => {
        if (m.role === 'user' || m.role === 'assistant') {
          recentMessages.push({ role: m.role, content: m.content, timestamp: m.createdAt });
        }
      });
    }

    // Episodic Memories
    const dbMems = await dbRepository.getMemories(studentId);
    const recentEpisodicMemories: EpisodicMemoryItem[] = dbMems
      .filter((m) => m.memoryType === 'EPISODIC')
      .map((m) => ({ id: m.id, studentId: m.studentId, summary: m.summary, keyTakeaway: m.keyTakeaway, bjjScenario: m.bjjScenario, date: m.createdAt }));

    // Active Learning Errors
    const dbErrs = await dbRepository.getLearningErrors(studentId);
    const activeErrors: LearningErrorItem[] = dbErrs
      .filter((e) => !e.resolved)
      .map((e) => ({ id: e.id, studentId: e.studentId, errorPattern: e.errorPattern, incorrectSentence: e.incorrectSentence, correctedSentence: e.correctedSentence, category: e.category, occurrenceCount: e.occurrenceCount, lastOccurredAt: e.lastOccurredAt, resolved: e.resolved }));

    // Priority Vocabulary
    const allVocab = await dbRepository.getAllVocabulary();
    const studentVocab = await dbRepository.getStudentVocabulary(studentId);
    const priorityVocabToReview: StudentVocabularyStatus[] = studentVocab
      .map((sv) => {
        const vocabDef = allVocab.find((v) => v.id === sv.vocabularyId);
        return { studentId: sv.studentId, vocabId: sv.vocabularyId, termEn: vocabDef ? vocabDef.termEn : 'BJJ Term', masteryLevel: sv.masteryLevel, lastReviewedAt: sv.lastReviewedAt, nextReviewDue: sv.nextReviewDue, mistakeCount: sv.mistakeCount };
      })
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, 5);

    return {
      studentId: profile.id,
      studentName: profile.name || 'Aluno JiuSpeak',
      bjjBelt: profile.bjjBelt,
      englishLevel: profile.englishLevel,
      shortTermMemory: { conversationId: conversationId || 'conv-active', recentMessages },
      recentEpisodicMemories,
      activeErrors,
      priorityVocabToReview,
    };
  }
}
