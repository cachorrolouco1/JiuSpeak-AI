/**
 * JiuSpeak AI - Knowledge & RAG Service Contracts
 */

import { KnowledgeQueryResult, SearchKnowledgeRequest, JiuSpeakCourseModule } from '../types/knowledge.types';

export interface IKnowledgeService {
  searchKnowledge(request: SearchKnowledgeRequest): Promise<KnowledgeQueryResult[]>;
  getOfficialModules(): Promise<JiuSpeakCourseModule[]>;
  getBJJLexiconTerm(term: string): Promise<KnowledgeQueryResult | null>;
}
