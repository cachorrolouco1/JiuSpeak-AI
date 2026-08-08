/**
 * JiuSpeak AI - Knowledge Base & RAG Types
 */

export type ContentSourceType = 'OFFICIAL_JIUSPEAK_CONTENT' | 'GENERAL_KNOWLEDGE';

export interface JiuSpeakCourseModule {
  id: string;
  courseTitle: string;
  moduleTitle: string;
  bjjTopic: string;
  level: string;
  summaryPt: string;
  keyPhrasesEn: Array<{ phrase: string; translation: string; contextNote: string }>;
  dialogueExamples: Array<{ speaker: string; textEn: string; textPt: string }>;
  isOfficialJiuSpeakContent: true;
}

export interface KnowledgeQueryResult {
  sourceType: ContentSourceType;
  title: string;
  content: string;
  relevanceScore: number;
  officialModuleId?: string;
  bjjTermEn?: string;
  bjjTermPt?: string;
}

export interface SearchKnowledgeRequest {
  query: string;
  limit?: number;
  preferOfficialOnly?: boolean;
}
