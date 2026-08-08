/**
 * JiuSpeak AI - SQLite Database Connection & Management
 * Uses sql.js for real relational SQL queries with disk persistence
 */

import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_FILE_PATH = path.join(process.cwd(), 'jiuspeak.db');

export class SqliteDatabase {
  private static instance: Database | null = null;
  private static initPromise: Promise<Database> | null = null;

  static async getDb(): Promise<Database> {
    if (this.instance) return this.instance;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const SQL = await initSqlJs();
      let db: Database;

      if (fs.existsSync(DB_FILE_PATH)) {
        try {
          const filebuffer = fs.readFileSync(DB_FILE_PATH);
          db = new SQL.Database(filebuffer);
        } catch (err) {
          console.warn('Failed to read existing database file, initializing fresh database:', err);
          db = new SQL.Database();
        }
      } else {
        db = new SQL.Database();
      }

      this.instance = db;
      this.createTables(db);
      this.saveToDisk();
      return db;
    })();

    return this.initPromise;
  }

  static saveToDisk() {
    if (!this.instance) return;
    try {
      const data = this.instance.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE_PATH, buffer);
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  private static createTables(db: Database) {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS student_profiles (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        bjjBelt TEXT NOT NULL,
        bjjStripes INTEGER NOT NULL,
        academyName TEXT NOT NULL,
        englishLevel TEXT NOT NULL,
        primaryObjective TEXT NOT NULL,
        preferredAvatarId TEXT NOT NULL,
        totalConversations INTEGER NOT NULL DEFAULT 0,
        totalExercisesCompleted INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        titlePt TEXT NOT NULL,
        descriptionPt TEXT NOT NULL,
        avatarImageUrl TEXT NOT NULL,
        voiceProvider TEXT NOT NULL,
        voiceId TEXT NOT NULL,
        voiceConfigured INTEGER NOT NULL DEFAULT 0,
        personality TEXT NOT NULL,
        teachingStyle TEXT NOT NULL,
        systemInstructions TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        teacherId TEXT NOT NULL DEFAULT 'marcos',
        title TEXT NOT NULL,
        topicCategory TEXT NOT NULL,
        bjjScenario TEXT,
        mode TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS conversation_messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        originalAudioUrl TEXT,
        generatedAudioUrl TEXT,
        generatedVideoUrl TEXT,
        hasPedagogicalFeedback INTEGER NOT NULL DEFAULT 0,
        pedagogicalFeedbackJson TEXT,
        tokensUsed INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS learning_progress (
        id TEXT PRIMARY KEY,
        studentId TEXT UNIQUE NOT NULL,
        overallScore INTEGER NOT NULL,
        grammarScore INTEGER NOT NULL,
        vocabularyScore INTEGER NOT NULL,
        fluencyScore INTEGER NOT NULL,
        comprehensionScore INTEGER NOT NULL,
        contextScore INTEGER NOT NULL,
        pronunciationScore INTEGER,
        confidenceScore INTEGER NOT NULL,
        strengthsJson TEXT NOT NULL,
        weaknessesJson TEXT NOT NULL,
        recommendationsJson TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vocabulary (
        id TEXT PRIMARY KEY,
        termEn TEXT NOT NULL,
        translationPt TEXT NOT NULL,
        bjjCategory TEXT NOT NULL,
        definitionPt TEXT NOT NULL,
        exampleSentenceEn TEXT NOT NULL,
        audioPronunciationUrl TEXT,
        isOfficialJiuSpeakContent INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS student_vocabulary (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        vocabularyId TEXT NOT NULL,
        masteryLevel INTEGER NOT NULL DEFAULT 0,
        mistakeCount INTEGER NOT NULL DEFAULT 0,
        lastReviewedAt TEXT NOT NULL,
        nextReviewDue TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS learning_errors (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        errorPattern TEXT NOT NULL,
        incorrectSentence TEXT NOT NULL,
        correctedSentence TEXT NOT NULL,
        category TEXT NOT NULL,
        occurrenceCount INTEGER NOT NULL DEFAULT 1,
        lastOccurredAt TEXT NOT NULL,
        resolved INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS evaluations (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        messageId TEXT NOT NULL,
        grammarScore INTEGER NOT NULL,
        vocabularyScore INTEGER NOT NULL,
        fluencyScore INTEGER NOT NULL,
        comprehensionScore INTEGER NOT NULL,
        contextScore INTEGER NOT NULL,
        pronunciationScore INTEGER,
        confidenceScore INTEGER NOT NULL,
        identifiedErrorsJson TEXT NOT NULL,
        pedagogicalAdvice TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        courseId TEXT,
        lessonId TEXT,
        title TEXT NOT NULL,
        bjjTopic TEXT NOT NULL,
        difficultyLevel TEXT NOT NULL,
        promptEn TEXT NOT NULL,
        contextPt TEXT NOT NULL,
        sampleCorrectAnswerEn TEXT NOT NULL,
        category TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS exercise_attempts (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        exerciseId TEXT NOT NULL,
        studentAnswer TEXT NOT NULL,
        score INTEGER NOT NULL,
        feedbackPt TEXT NOT NULL,
        completedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        memoryType TEXT NOT NULL,
        summary TEXT NOT NULL,
        keyTakeaway TEXT NOT NULL,
        bjjScenario TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        descriptionPt TEXT NOT NULL,
        targetBelt TEXT NOT NULL,
        isOfficialJiuSpeakContent INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        moduleOrder INTEGER NOT NULL,
        title TEXT NOT NULL,
        summaryPt TEXT NOT NULL,
        keyPhrasesJson TEXT NOT NULL,
        dialogueExamplesJson TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS avatar_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        titlePt TEXT NOT NULL,
        descriptionPt TEXT NOT NULL,
        bjjBelt TEXT NOT NULL,
        avatarImageUrl TEXT NOT NULL,
        voiceId TEXT NOT NULL,
        defaultLanguage TEXT NOT NULL,
        personalityStyle TEXT NOT NULL,
        supportedModesJson TEXT NOT NULL
      );
    `);

    // Schema Migrations for existing databases on disk
    try {
      const tableInfo = db.exec("PRAGMA table_info(teachers)");
      if (tableInfo.length > 0) {
        const cols = tableInfo[0].values.map((v) => v[1]);
        if (!cols.includes('voiceConfigured')) {
          db.run("ALTER TABLE teachers ADD COLUMN voiceConfigured INTEGER NOT NULL DEFAULT 0;");
        }
      }
    } catch (err) {
      console.warn('Migration check for teachers table:', err);
    }
  }
}
