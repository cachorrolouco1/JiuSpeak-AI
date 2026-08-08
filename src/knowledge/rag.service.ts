/**
 * JiuSpeak AI - Knowledge & RAG Service with Semantic Cosine Similarity
 * Explicitly distinguishes OFFICIAL_JIUSPEAK_CONTENT vs GENERAL_KNOWLEDGE
 */

import { IKnowledgeService } from '../core/interfaces/knowledge-service.interface';
import { KnowledgeQueryResult, SearchKnowledgeRequest, JiuSpeakCourseModule } from '../core/types/knowledge.types';
import { OFFICIAL_JIUSPEAK_MODULES } from './official-content';
import { BJJ_ENGLISH_LEXICON } from './bjj-lexicon';
import { EmbeddingService } from './embedding.service';
import { dbRepository } from '../db/repository';

export class RAGKnowledgeService implements IKnowledgeService {
  async searchKnowledge(request: SearchKnowledgeRequest): Promise<KnowledgeQueryResult[]> {
    const queryTokens = EmbeddingService.tokenize(request.query);
    const results: Array<{ item: KnowledgeQueryResult; score: number }> = [];

    // 1. Search Official Modules using Cosine Similarity
    for (const mod of OFFICIAL_JIUSPEAK_MODULES) {
      const docText = `${mod.moduleTitle} ${mod.bjjTopic} ${mod.summaryPt} ${mod.keyPhrasesEn.map((kp) => `${kp.phrase} ${kp.translation}`).join(' ')}`;
      const docTokens = EmbeddingService.tokenize(docText);
      const score = EmbeddingService.cosineSimilarity(queryTokens, docTokens);

      if (score > 0.1) {
        results.push({
          item: {
            sourceType: 'OFFICIAL_JIUSPEAK_CONTENT',
            title: `[Conteúdo Oficial JiuSpeak] ${mod.moduleTitle}`,
            content: `${mod.summaryPt}\nPrincipais frases em inglês:\n${mod.keyPhrasesEn.map((kp) => `- "${kp.phrase}": ${kp.translation}`).join('\n')}`,
            relevanceScore: Math.min(0.99, Number((score + 0.3).toFixed(2))),
            officialModuleId: mod.id,
          },
          score,
        });
      }
    }

    // 2. Search Database Vocabulary & BJJ Lexicon
    const dbVocab = await dbRepository.getAllVocabulary();
    const vocabSources = dbVocab.length > 0 ? dbVocab : BJJ_ENGLISH_LEXICON;

    for (const entry of vocabSources) {
      const docText = `${entry.termEn} ${entry.translationPt} ${entry.definitionPt} ${entry.exampleSentenceEn}`;
      const docTokens = EmbeddingService.tokenize(docText);
      const score = EmbeddingService.cosineSimilarity(queryTokens, docTokens);

      if (score > 0.1) {
        results.push({
          item: {
            sourceType: 'OFFICIAL_JIUSPEAK_CONTENT',
            title: `[Vocabulário Técnico JiuSpeak] ${entry.termEn} (${entry.translationPt})`,
            content: `Definição: ${entry.definitionPt}\nExemplo: "${entry.exampleSentenceEn}"`,
            relevanceScore: Math.min(0.98, Number((score + 0.35).toFixed(2))),
            bjjTermEn: entry.termEn,
            bjjTermPt: entry.translationPt,
          },
          score,
        });
      }
    }

    // Sort by semantic relevance score descending
    results.sort((a, b) => b.score - a.score);
    const topResults = results.map((r) => r.item);

    // 3. Fallback General Knowledge if official content score is low and general knowledge permitted
    if (topResults.length === 0 && !request.preferOfficialOnly) {
      topResults.push({
        sourceType: 'GENERAL_KNOWLEDGE',
        title: `[Conhecimento Geral de BJJ & Inglês] Expressões Gerais para "${request.query}"`,
        content: `Informação de apoio linguístico geral. Para terminologia oficial e matriz curricular do curso, consulte os módulos do JiuSpeak.`,
        relevanceScore: 0.5,
      });
    }

    return topResults.slice(0, request.limit || 5);
  }

  async getOfficialModules(): Promise<JiuSpeakCourseModule[]> {
    return OFFICIAL_JIUSPEAK_MODULES;
  }

  async getBJJLexiconTerm(term: string): Promise<KnowledgeQueryResult | null> {
    const allVocab = await dbRepository.getAllVocabulary();
    const entry = allVocab.find(
      (e) => e.termEn.toLowerCase() === term.toLowerCase() || e.translationPt.toLowerCase().includes(term.toLowerCase())
    );

    if (!entry) return null;

    return {
      sourceType: 'OFFICIAL_JIUSPEAK_CONTENT',
      title: `${entry.termEn} - ${entry.translationPt}`,
      content: `${entry.definitionPt}\nExemplo: "${entry.exampleSentenceEn}"`,
      relevanceScore: 1.0,
      bjjTermEn: entry.termEn,
      bjjTermPt: entry.translationPt,
    };
  }
}
