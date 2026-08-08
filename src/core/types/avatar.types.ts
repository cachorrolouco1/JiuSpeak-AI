/**
 * JiuSpeak AI - Avatar Engine Types
 */

export interface AvatarProfile {
  id: string;
  name: string;
  titlePt: string; // e.g. "Prof. JiuSpeak - Faixa Preta"
  descriptionPt: string;
  bjjBelt: string;
  avatarImageUrl: string;
  voiceId: string;
  defaultLanguage: string;
  personalityStyle: string;
  supportedModes: Array<'realtime' | 'pregenerated_video'>;
}

export interface AvatarRealtimeSessionRequest {
  avatarId: string;
  studentId: string;
  audioInputUrl?: string;
}

export interface AvatarRealtimeSessionResponse {
  sessionId: string;
  streamUrl: string;
  avatarProfile: AvatarProfile;
  connectedAt: string;
}

export interface AvatarVideoGenerationRequest {
  avatarId: string;
  scriptText: string;
  audioBase64?: string;
  bjjTopic?: string;
}

export interface AvatarVideoGenerationResponse {
  videoId: string;
  videoUrl: string | null;
  durationSeconds: number;
  status: 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED' | 'UNCONFIGURED_PROVIDER';
  createdAt: string;
}
