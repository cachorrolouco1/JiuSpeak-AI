/**
 * JiuSpeak AI - Chat & Conversation Types
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export type InteractionMode = 'text' | 'voice' | 'avatar_realtime' | 'avatar_video';

export interface PedagogicalFeedback {
  hasError: boolean;
  detectedError?: string;
  explanationPt?: string; // Explanation in Portuguese
  correctFormEn?: string; // Natural form in English
  exampleUsage?: string;
  suggestedRetry?: string;
  category: 'GRAMMAR' | 'VOCABULARY' | 'PRONUNCIATION' | 'FLUENCY' | 'BJJ_CONTEXT';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  originalAudioUrl?: string;
  generatedAudioUrl?: string;
  generatedVideoUrl?: string;
  pedagogicalFeedback?: PedagogicalFeedback;
  mode: InteractionMode;
  createdAt: string;
  tokensUsed?: number;
}

export interface Conversation {
  id: string;
  studentId: string;
  title: string;
  topicCategory: 'DRILLING' | 'SPARRING' | 'COMPETITION' | 'SEMINAR' | 'FREE_CHAT' | 'EXERCISE';
  bjjScenario?: string;
  mode: InteractionMode;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface SendMessageRequest {
  studentId: string;
  conversationId?: string;
  message: string;
  mode?: InteractionMode;
  audioBase64?: string;
  bjjScenario?: string;
  avatarId?: string;
}

export interface SendMessageResponse {
  conversationId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  pedagogicalFeedback?: PedagogicalFeedback;
  audioUrl?: string;
  videoUrl?: string;
  tokensUsed: number;
  estimatedCostUsd: number;
}
