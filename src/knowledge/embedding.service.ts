/**
 * JiuSpeak AI - Semantic Vector & Embedding Service
 * Computes semantic relevance vectors and TF-IDF cosine similarity for BJJ curriculum retrieval
 */

export class EmbeddingService {
  /**
   * Tokenizes text into normalized term frequencies
   */
  static tokenize(text: string): Map<string, number> {
    const tokens = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const freqMap = new Map<string, number>();
    tokens.forEach((token) => {
      freqMap.set(token, (freqMap.get(token) || 0) + 1);
    });
    return freqMap;
  }

  /**
   * Calculates Cosine Similarity between query token vector and document token vector
   */
  static cosineSimilarity(queryVec: Map<string, number>, docVec: Map<string, number>): number {
    let dotProduct = 0;
    let queryNorm = 0;
    let docNorm = 0;

    queryVec.forEach((val, key) => {
      queryNorm += val * val;
      if (docVec.has(key)) {
        dotProduct += val * (docVec.get(key) || 0);
      }
    });

    docVec.forEach((val) => {
      docNorm += val * val;
    });

    if (queryNorm === 0 || docNorm === 0) return 0;
    return dotProduct / (Math.sqrt(queryNorm) * Math.sqrt(docNorm));
  }
}
