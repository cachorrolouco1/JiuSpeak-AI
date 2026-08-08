/**
 * JiuSpeak AI - Complete Database Schema Definitions
 * Supporting all 15 Core Entities required by JiuSpeak platform
 */

export interface DbUser {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface DbStudentProfile {
  id: string;
  userId: string;
  bjjBelt: 'White' | 'Blue' | 'Purple' | 'Brown' | 'Black';
  bjjStripes: number;
  academyName: string;
  englishLevel: 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced';
  primaryObjective: string;
  preferredAvatarId: string;
  totalConversations: number;
  totalExercisesCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbTeacher {
  id: string; // 'marcos' | 'carol'
  name: string; // 'Professor Marcos' | 'Professora Carol'
  gender: 'MALE' | 'FEMALE';
  titlePt: string;
  descriptionPt: string;
  avatarImageUrl: string;
  voiceProvider: string;
  voiceId: string; // Server-side secret voice ID
  voiceConfigured: boolean; // True if voiceId is present and non-empty
  personality: string;
  teachingStyle: string;
  systemInstructions: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTeacherProfile {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  titlePt: string;
  descriptionPt: string;
  avatarImageUrl: string;
  voiceProvider: string;
  voiceConfigured: boolean;
  personality: string;
  teachingStyle: string;
  active: boolean;
}

export interface DbConversation {
  id: string;
  studentId: string;
  teacherId: string; // 'marcos' | 'carol'
  title: string;
  topicCategory: 'DRILLING' | 'SPARRING' | 'COMPETITION' | 'SEMINAR' | 'FREE_CHAT' | 'EXERCISE';
  bjjScenario?: string;
  mode: 'text' | 'voice' | 'avatar_realtime' | 'avatar_video';
  createdAt: string;
  updatedAt: string;
}

export interface DbConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  originalAudioUrl?: string;
  generatedAudioUrl?: string;
  generatedVideoUrl?: string;
  hasPedagogicalFeedback: boolean;
  pedagogicalFeedbackJson?: string;
  tokensUsed: number;
  createdAt: string;
}

export interface DbLearningProgress {
  id: string;
  studentId: string;
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  comprehensionScore: number;
  contextScore: number;
  pronunciationScore: number | null; // Null if no audio evaluation
  confidenceScore: number;
  strengthsJson: string;
  weaknessesJson: string;
  recommendationsJson: string;
  updatedAt: string;
}

export interface DbVocabulary {
  id: string;
  termEn: string;
  translationPt: string;
  bjjCategory: 'POSITIONS' | 'SUBMISSIONS' | 'PASSING' | 'GUARD' | 'COMMANDS' | 'COMPETITION' | 'GENERAL';
  definitionPt: string;
  exampleSentenceEn: string;
  audioPronunciationUrl?: string;
  isOfficialJiuSpeakContent: boolean;
  createdAt: string;
}

export interface DbStudentVocabulary {
  id: string;
  studentId: string;
  vocabularyId: string;
  masteryLevel: number; // 0 to 5
  mistakeCount: number;
  lastReviewedAt: string;
  nextReviewDue: string;
}

export interface DbLearningError {
  id: string;
  studentId: string;
  errorPattern: string;
  incorrectSentence: string;
  correctedSentence: string;
  category: string;
  occurrenceCount: number;
  lastOccurredAt: string;
  resolved: boolean;
}

export interface DbEvaluation {
  id: string;
  studentId: string;
  messageId: string;
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  comprehensionScore: number;
  contextScore: number;
  pronunciationScore: number | null;
  confidenceScore: number;
  identifiedErrorsJson: string;
  pedagogicalAdvice: string;
  createdAt: string;
}

export interface DbExercise {
  id: string;
  courseId?: string;
  lessonId?: string;
  title: string;
  bjjTopic: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  promptEn: string;
  contextPt: string;
  sampleCorrectAnswerEn: string;
  category: 'TRANSLATION' | 'DRILL_RESPONSE' | 'REF_COMMAND' | 'TEACHING_SIMULATION';
  createdAt: string;
}

export interface DbExerciseAttempt {
  id: string;
  studentId: string;
  exerciseId: string;
  studentAnswer: string;
  score: number;
  feedbackPt: string;
  completedAt: string;
}

export interface DbMemory {
  id: string;
  studentId: string;
  memoryType: 'EPISODIC' | 'SEMANTIC' | 'SHORT_TERM';
  summary: string;
  keyTakeaway: string;
  bjjScenario: string;
  createdAt: string;
}

export interface DbCourse {
  id: string;
  title: string;
  descriptionPt: string;
  targetBelt: string;
  isOfficialJiuSpeakContent: boolean;
  createdAt: string;
}

export interface DbLesson {
  id: string;
  courseId: string;
  moduleOrder: number;
  title: string;
  summaryPt: string;
  keyPhrasesJson: string;
  dialogueExamplesJson: string;
  createdAt: string;
}

export interface DbAvatarProfile {
  id: string;
  name: string;
  titlePt: string;
  descriptionPt: string;
  bjjBelt: string;
  avatarImageUrl: string;
  voiceId: string;
  defaultLanguage: string;
  personalityStyle: string;
  supportedModesJson: string;
}
