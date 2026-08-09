/**
 * JiuSpeak AI - Real SQL Database Repository Layer
 * Manages database persistence using SQLite (sql.js) for all 15 Entities
 */

import { SqliteDatabase } from './sqlite-db';
import {
  DbUser,
  DbStudentProfile,
  DbConversation,
  DbConversationMessage,
  DbLearningProgress,
  DbVocabulary,
  DbStudentVocabulary,
  DbLearningError,
  DbEvaluation,
  DbExercise,
  DbExerciseAttempt,
  DbMemory,
  DbCourse,
  DbLesson,
  DbAvatarProfile,
  DbTeacher,
  PublicTeacherProfile,
} from './schema';
import { OFFICIAL_AVATARS } from '../core/entities/bjj.constants';
import { OFFICIAL_TEACHERS, toPublicTeacherProfile } from '../core/entities/teacher.constants';
import { seedCurriculum } from './seed-curriculum';

export class DatabaseRepository {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    const db = await SqliteDatabase.getDb();
    
    // Seed initial data if empty
    const userStmt = db.prepare("SELECT COUNT(*) as count FROM users");
    if (userStmt.step()) {
      const row = userStmt.getAsObject();
      if ((row.count as number) === 0) {
        this.seedInitialData(db);
      }
    }
    userStmt.free();
    this.initialized = true;
  }

  private seedInitialData(db: any) {
    const userId = 'usr-carlos-123';
    const studentId = 'std-carlos-123';
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO users (id, email, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, 'carlos.bjj@jiuspeak.com', 'Carlos "Grip" Silva', 'STUDENT', now, now]
    );

    db.run(
      `INSERT INTO student_profiles (id, userId, bjjBelt, bjjStripes, academyName, englishLevel, primaryObjective, preferredAvatarId, totalConversations, totalExercisesCompleted, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        userId,
        'Blue',
        2,
        'Alliance BJJ International',
        'Intermediate',
        'Participar de campeonatos da IBJJF na Califórnia e dar aulas para estrangeiros',
        'prof-jiuspeak-master',
        14,
        8,
        now,
        now,
      ]
    );

    db.run(
      `INSERT INTO learning_progress (id, studentId, overallScore, grammarScore, vocabularyScore, fluencyScore, comprehensionScore, contextScore, pronunciationScore, confidenceScore, strengthsJson, weaknessesJson, recommendationsJson, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `prog-${studentId}`,
        studentId,
        78,
        74,
        88,
        72,
        85,
        90,
        null,
        80,
        JSON.stringify(['Vocabulário de Passagens', 'Comando de Árbitro', 'Terminologia de Guarda']),
        JSON.stringify(['Uso de Since vs For', 'Past Perfect em sequências de luta']),
        JSON.stringify(['Treinar simulação de instrução com parceiro em inglês', 'Revisar preposições de tempo']),
        now,
      ]
    );

    OFFICIAL_TEACHERS.forEach((t) => {
      db.run(
        `INSERT INTO teachers (id, name, gender, titlePt, descriptionPt, avatarImageUrl, voiceProvider, voiceId, voiceConfigured, personality, teachingStyle, systemInstructions, active, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.name,
          t.gender,
          t.titlePt,
          t.descriptionPt,
          t.avatarImageUrl,
          t.voiceProvider,
          t.voiceId,
          t.voiceConfigured ? 1 : 0,
          t.personality,
          t.teachingStyle,
          t.systemInstructions,
          t.active ? 1 : 0,
          t.createdAt,
          t.updatedAt,
        ]
      );
    });

    OFFICIAL_AVATARS.forEach((av) => {
      db.run(
        `INSERT INTO avatar_profiles (id, name, titlePt, descriptionPt, bjjBelt, avatarImageUrl, voiceId, defaultLanguage, personalityStyle, supportedModesJson)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          av.id,
          av.name,
          av.titlePt,
          av.descriptionPt,
          av.bjjBelt,
          av.avatarImageUrl,
          av.voiceId,
          av.defaultLanguage,
          av.personalityStyle,
          JSON.stringify(av.supportedModes),
        ]
      );
    });

    const vocabList = [
      {
        id: 'voc-knee-cut',
        termEn: 'Knee cut pass',
        translationPt: 'Passagem cortando o joelho / Passagem de joelho',
        bjjCategory: 'PASSING',
        definitionPt: 'Passagem de guarda em que o atleta projeta o joelho sobre a coxa do adversário.',
        exampleSentenceEn: 'Drive your knee across his thigh to complete the knee cut pass.',
        isOfficialJiuSpeakContent: 1,
      },
      {
        id: 'voc-cross-collar',
        termEn: 'Cross collar choke',
        translationPt: 'Estrangulamento cruzado na gola',
        bjjCategory: 'SUBMISSIONS',
        definitionPt: 'Finalização efetuada cruzando as pegadas na gola do adversário.',
        exampleSentenceEn: 'Deepen your second grip behind the neck before pulling for the cross collar choke.',
        isOfficialJiuSpeakContent: 1,
      },
      {
        id: 'voc-underhook',
        termEn: 'Underhook',
        translationPt: 'Esgrima / Esgrimar por baixo',
        bjjCategory: 'POSITIONS',
        definitionPt: 'Pegada em que o braço passa por baixo da axila do oponente para controlar a esgrima.',
        exampleSentenceEn: 'Get a tight underhook on the far side before sitting up to single leg.',
        isOfficialJiuSpeakContent: 1,
      },
      {
        id: 'voc-sweep',
        termEn: 'Sweep',
        translationPt: 'Raspagem / Raspar',
        bjjCategory: 'GUARD',
        definitionPt: 'Inversão de posição quando o atleta está por baixo na guarda.',
        exampleSentenceEn: 'Load his weight onto your knees to setup the scissor sweep.',
        isOfficialJiuSpeakContent: 1,
      },
      {
        id: 'voc-advantage',
        termEn: 'Advantage',
        translationPt: 'Vantagem (Regras IBJJF)',
        bjjCategory: 'COMPETITION',
        definitionPt: 'Pontuação atribuída por quase completar uma pontuação ou finalização.',
        exampleSentenceEn: 'The referee awarded an advantage for the deep armbar attempt.',
        isOfficialJiuSpeakContent: 1,
      },
    ];

    vocabList.forEach((v) => {
      db.run(
        `INSERT INTO vocabulary (id, termEn, translationPt, bjjCategory, definitionPt, exampleSentenceEn, isOfficialJiuSpeakContent, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.termEn, v.translationPt, v.bjjCategory, v.definitionPt, v.exampleSentenceEn, v.isOfficialJiuSpeakContent, now]
      );

      db.run(
        `INSERT INTO student_vocabulary (id, studentId, vocabularyId, masteryLevel, mistakeCount, lastReviewedAt, nextReviewDue)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `sv-${studentId}-${v.id}`,
          studentId,
          v.id,
          v.id === 'voc-knee-cut' ? 4 : 2,
          v.id === 'voc-underhook' ? 3 : 0,
          now,
          new Date(Date.now() + 86400000 * 2).toISOString(),
        ]
      );
    });

    db.run(
      `INSERT INTO learning_errors (id, studentId, errorPattern, incorrectSentence, correctedSentence, category, occurrenceCount, lastOccurredAt, resolved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'err-1',
        studentId,
        "Uso incorreto de 'since' no lugar de 'for' com duração",
        'I am training Jiu-Jitsu since two years.',
        'I have been training Jiu-Jitsu for two years.',
        'GRAMMAR',
        2,
        now,
        0,
      ]
    );

    db.run(
      `INSERT INTO memories (id, studentId, memoryType, summary, keyTakeaway, bjjScenario, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'mem-1',
        studentId,
        'EPISODIC',
        'Treinou diálogos de instrução de armlock na guarda fechada',
        'Precisa focar no uso correto dos verbos de ação: "break the posture", "pivot your hips"',
        'SEMINAR',
        now,
      ]
    );

    const courseId = 'crs-jiuspeak-101';
    db.run(
      `INSERT INTO courses (id, title, descriptionPt, targetBelt, isOfficialJiuSpeakContent, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        'JiuSpeak Master: English for IBJJF Competitors & Coaches',
        'Curso Oficial JiuSpeak para comunicação em campeonatos, arbitragem e seminários.',
        'All Belts',
        1,
        now,
      ]
    );

    db.run(
      `INSERT INTO lessons (id, courseId, moduleOrder, title, summaryPt, keyPhrasesJson, dialogueExamplesJson, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'lsn-1',
        courseId,
        1,
        'Module 1: Giving Clear Commands During Sparring & Drilling',
        'Como se comunicar com eficiência e clareza durante o treino de dril e sparring no exterior.',
        JSON.stringify([
          { phrase: 'Let us start light', translation: 'Vamos começar leve' },
          { phrase: 'Watch your head position', translation: 'Atenção com a posição da cabeça' },
          { phrase: 'Tap out early', translation: 'Bata logo / Não resista até machucar' },
        ]),
        JSON.stringify([
          { speaker: 'Professor', textEn: 'Pass the guard using the pressure stack pass.', textPt: 'Passe a guarda usando a passagem emborcando com pressão.' },
          { speaker: 'Student', textEn: 'Got it, professor! Should I grip the belt or the trousers?', textPt: 'Entendido, professor! Devo segurar na faixa ou na calça?' },
        ]),
        now,
      ]
    );

    db.run(
      `INSERT INTO exercises (id, courseId, lessonId, title, bjjTopic, difficultyLevel, promptEn, contextPt, sampleCorrectAnswerEn, category, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ex-1',
        courseId,
        'lsn-1',
        'Drill Instruction Correction',
        'Passing Guard',
        'Intermediate',
        'Correct the following sentence: "I train BJJ since 2021 and I like very much guard pass."',
        'Reescreva a frase de forma fluida e gramaticalmente correta em inglês técnico de BJJ.',
        'I have been training BJJ since 2021, and I really enjoy passing the guard.',
        'TRANSLATION',
        now,
      ]
    );

    // Seed the full 100-lesson curriculum
    seedCurriculum(db);

    SqliteDatabase.saveToDisk();
  }

  // --- Lessons by Course IDs (for curriculum context in system prompt) ---
  async getLessonsByCourseIds(courseIds: string[]): Promise<any[]> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const placeholders = courseIds.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT * FROM lessons WHERE courseId IN (${placeholders}) ORDER BY courseId, moduleOrder ASC`);
    stmt.bind(courseIds);
    const list: any[] = [];
    while (stmt.step()) {
      list.push(stmt.getAsObject());
    }
    stmt.free();
    return list;
  }

  // --- Student Profile & Users ---
  async getStudentProfile(studentId: string): Promise<(DbStudentProfile & { name?: string; email?: string }) | null> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`
      SELECT sp.*, u.name, u.email 
      FROM student_profiles sp
      JOIN users u ON sp.userId = u.id
      WHERE sp.id = ?
    `);
    stmt.bind([studentId]);
    if (stmt.step()) {
      const row: any = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  // --- Messages ---
  async addMessage(msg: DbConversationMessage): Promise<void> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    db.run(
      `INSERT INTO conversation_messages (id, conversationId, role, content, originalAudioUrl, generatedAudioUrl, generatedVideoUrl, hasPedagogicalFeedback, pedagogicalFeedbackJson, tokensUsed, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        msg.id,
        msg.conversationId,
        msg.role,
        msg.content,
        msg.originalAudioUrl || null,
        msg.generatedAudioUrl || null,
        msg.generatedVideoUrl || null,
        msg.hasPedagogicalFeedback ? 1 : 0,
        msg.pedagogicalFeedbackJson || null,
        msg.tokensUsed || 0,
        msg.createdAt,
      ]
    );
    SqliteDatabase.saveToDisk();
  }

  async getMessagesByConversation(conversationId: string): Promise<DbConversationMessage[]> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`SELECT * FROM conversation_messages WHERE conversationId = ? ORDER BY createdAt ASC`);
    stmt.bind([conversationId]);
    const list: DbConversationMessage[] = [];
    while (stmt.step()) {
      const row: any = stmt.getAsObject();
      list.push({
        ...row,
        hasPedagogicalFeedback: Boolean(row.hasPedagogicalFeedback),
      });
    }
    stmt.free();
    return list;
  }

  // --- Progress ---
  async getStudentProgress(studentId: string): Promise<DbLearningProgress | null> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`SELECT * FROM learning_progress WHERE studentId = ?`);
    stmt.bind([studentId]);
    if (stmt.step()) {
      const row: any = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  async updateStudentProgress(progress: DbLearningProgress): Promise<void> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    db.run(
      `INSERT OR REPLACE INTO learning_progress 
       (id, studentId, overallScore, grammarScore, vocabularyScore, fluencyScore, comprehensionScore, contextScore, pronunciationScore, confidenceScore, strengthsJson, weaknessesJson, recommendationsJson, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        progress.id,
        progress.studentId,
        progress.overallScore,
        progress.grammarScore,
        progress.vocabularyScore,
        progress.fluencyScore,
        progress.comprehensionScore,
        progress.contextScore,
        progress.pronunciationScore,
        progress.confidenceScore,
        progress.strengthsJson,
        progress.weaknessesJson,
        progress.recommendationsJson,
        progress.updatedAt,
      ]
    );
    SqliteDatabase.saveToDisk();
  }

  // --- Learning Errors ---
  async getLearningErrors(studentId: string): Promise<DbLearningError[]> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`SELECT * FROM learning_errors WHERE studentId = ? ORDER BY lastOccurredAt DESC`);
    stmt.bind([studentId]);
    const list: DbLearningError[] = [];
    while (stmt.step()) {
      const row: any = stmt.getAsObject();
      list.push({ ...row, resolved: Boolean(row.resolved) });
    }
    stmt.free();
    return list;
  }

  async saveLearningError(error: DbLearningError): Promise<void> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    db.run(
      `INSERT OR REPLACE INTO learning_errors (id, studentId, errorPattern, incorrectSentence, correctedSentence, category, occurrenceCount, lastOccurredAt, resolved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        error.id,
        error.studentId,
        error.errorPattern,
        error.incorrectSentence,
        error.correctedSentence,
        error.category,
        error.occurrenceCount,
        error.lastOccurredAt,
        error.resolved ? 1 : 0,
      ]
    );
    SqliteDatabase.saveToDisk();
  }

  // --- Memories ---
  async getMemories(studentId: string): Promise<DbMemory[]> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`SELECT * FROM memories WHERE studentId = ? ORDER BY createdAt DESC`);
    stmt.bind([studentId]);
    const list: DbMemory[] = [];
    while (stmt.step()) {
      list.push(stmt.getAsObject() as any);
    }
    stmt.free();
    return list;
  }

  async addMemory(memory: DbMemory): Promise<void> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    db.run(
      `INSERT INTO memories (id, studentId, memoryType, summary, keyTakeaway, bjjScenario, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [memory.id, memory.studentId, memory.memoryType, memory.summary, memory.keyTakeaway, memory.bjjScenario, memory.createdAt]
    );
    SqliteDatabase.saveToDisk();
  }

  // --- Vocabulary ---
  async getAllVocabulary(): Promise<DbVocabulary[]> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`SELECT * FROM vocabulary`);
    const list: DbVocabulary[] = [];
    while (stmt.step()) {
      const row: any = stmt.getAsObject();
      list.push({ ...row, isOfficialJiuSpeakContent: Boolean(row.isOfficialJiuSpeakContent) });
    }
    stmt.free();
    return list;
  }

  async getStudentVocabulary(studentId: string): Promise<DbStudentVocabulary[]> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`SELECT * FROM student_vocabulary WHERE studentId = ?`);
    stmt.bind([studentId]);
    const list: DbStudentVocabulary[] = [];
    while (stmt.step()) {
      list.push(stmt.getAsObject() as any);
    }
    stmt.free();
    return list;
  }

  async saveStudentVocabulary(sv: DbStudentVocabulary): Promise<void> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    db.run(
      `INSERT OR REPLACE INTO student_vocabulary (id, studentId, vocabularyId, masteryLevel, mistakeCount, lastReviewedAt, nextReviewDue)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sv.id, sv.studentId, sv.vocabularyId, sv.masteryLevel, sv.mistakeCount, sv.lastReviewedAt, sv.nextReviewDue]
    );
    SqliteDatabase.saveToDisk();
  }

  // --- Avatars ---
  async getAvatars(): Promise<DbAvatarProfile[]> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`SELECT * FROM avatar_profiles`);
    const list: DbAvatarProfile[] = [];
    while (stmt.step()) {
      list.push(stmt.getAsObject() as any);
    }
    stmt.free();
    return list;
  }

  // --- Teachers (Official Instructors) ---
  async getTeachers(): Promise<DbTeacher[]> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`SELECT * FROM teachers WHERE active = 1`);
    const list: DbTeacher[] = [];
    while (stmt.step()) {
      const row: any = stmt.getAsObject();
      const isVoiceConfigured = Boolean(
        row.voiceConfigured || (row.voiceId && String(row.voiceId).trim() !== '' && String(row.voiceId) !== '[AGUARDANDO CONFIGURAÇÃO]')
      );
      list.push({
        ...row,
        active: Boolean(row.active),
        voiceConfigured: isVoiceConfigured,
      });
    }
    stmt.free();

    // Fallback if DB empty
    if (list.length === 0) {
      return OFFICIAL_TEACHERS;
    }
    return list;
  }

  async getPublicTeachers(): Promise<PublicTeacherProfile[]> {
    const teachers = await this.getTeachers();
    return teachers.map(toPublicTeacherProfile);
  }

  async getTeacherById(teacherId: string): Promise<DbTeacher> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const stmt = db.prepare(`SELECT * FROM teachers WHERE id = ?`);
    stmt.bind([teacherId]);
    if (stmt.step()) {
      const row: any = stmt.getAsObject();
      stmt.free();
      const isVoiceConfigured = Boolean(
        row.voiceConfigured || (row.voiceId && String(row.voiceId).trim() !== '' && String(row.voiceId) !== '[AGUARDANDO CONFIGURAÇÃO]')
      );
      return {
        ...row,
        active: Boolean(row.active),
        voiceConfigured: isVoiceConfigured,
      };
    }
    stmt.free();

    // Fallback to Marcos or Carol from constants if not found in DB
    const foundInConst = OFFICIAL_TEACHERS.find((t) => t.id === teacherId);
    return foundInConst || OFFICIAL_TEACHERS[0];
  }

  async saveTeacher(teacher: DbTeacher): Promise<void> {
    await this.init();
    const db = await SqliteDatabase.getDb();
    const isVoiceConfigured = Boolean(
      teacher.voiceId && teacher.voiceId.trim() !== '' && teacher.voiceId !== '[AGUARDANDO CONFIGURAÇÃO]'
    );
    const updatedTeacher = {
      ...teacher,
      voiceConfigured: isVoiceConfigured,
      updatedAt: new Date().toISOString(),
    };

    db.run(
      `INSERT OR REPLACE INTO teachers (id, name, gender, titlePt, descriptionPt, avatarImageUrl, voiceProvider, voiceId, voiceConfigured, personality, teachingStyle, systemInstructions, active, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        updatedTeacher.id,
        updatedTeacher.name,
        updatedTeacher.gender,
        updatedTeacher.titlePt,
        updatedTeacher.descriptionPt,
        updatedTeacher.avatarImageUrl,
        updatedTeacher.voiceProvider,
        updatedTeacher.voiceId,
        updatedTeacher.voiceConfigured ? 1 : 0,
        updatedTeacher.personality,
        updatedTeacher.teachingStyle,
        updatedTeacher.systemInstructions,
        updatedTeacher.active ? 1 : 0,
        updatedTeacher.createdAt,
        updatedTeacher.updatedAt,
      ]
    );
    SqliteDatabase.saveToDisk();
  }
}

export const dbRepository = new DatabaseRepository();
