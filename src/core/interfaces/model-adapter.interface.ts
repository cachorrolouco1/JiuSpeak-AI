/**
 * JiuSpeak AI - Model Adapter & AI Core Service Contracts
 */

import { ChatMessage } from '../types/chat.types';
import { StudentMemoryContext } from '../types/memory.types';
import { CostEstimate } from '../types/cost.types';

export interface ModelPromptOptions {
  systemInstruction: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

export interface ModelResponse {
  text: string;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  modelName: string;
}

export interface IModelAdapter {
  generateText(prompt: string, options: ModelPromptOptions): Promise<ModelResponse>;
  generateStructuredJSON<T>(prompt: string, jsonSchemaDescription: string, options: ModelPromptOptions): Promise<{ data: T; usage: ModelResponse }>;
}

export interface IAICoreService {
  processChatMessage(
    studentId: string,
    userMessageText: string,
    conversationHistory: ChatMessage[],
    memoryContext: StudentMemoryContext,
    bjjScenario?: string
  ): Promise<{
    assistantResponseText: string;
    pedagogicalFeedback?: {
      hasError: boolean;
      detectedError?: string;
      explanationPt?: string;
      correctFormEn?: string;
      exampleUsage?: string;
      suggestedRetry?: string;
      category: 'GRAMMAR' | 'VOCABULARY' | 'PRONUNCIATION' | 'FLUENCY' | 'BJJ_CONTEXT';
    };
    costEstimate: CostEstimate;
  }>;
}
