/**
 * JiuSpeak AI - Cost & Token Observability Types
 */

export type AIModelTier = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.0-flash';

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

export interface CostEstimate {
  model: string;
  tokens: TokenUsage;
  estimatedCostUsd: number;
  durationMs: number;
  provider: 'GoogleGemini' | 'ElevenLabs' | 'AvatarProvider';
  timestamp: string;
}

export interface StudentCostBudget {
  studentId: string;
  dailyMessageLimit: number;
  dailyMessagesUsed: number;
  monthlyTokenLimit: number;
  monthlyTokensUsed: number;
  monthlyBudgetUsd: number;
  currentSpendUsd: number;
}
