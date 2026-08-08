/**
 * JiuSpeak AI - Avatar Engine Service & Adapter Contracts
 */

import {
  AvatarProfile,
  AvatarRealtimeSessionRequest,
  AvatarRealtimeSessionResponse,
  AvatarVideoGenerationRequest,
  AvatarVideoGenerationResponse,
} from '../types/avatar.types';

export interface IAvatarAdapter {
  getAvailableAvatars(): Promise<AvatarProfile[]>;
  createRealtimeSession(request: AvatarRealtimeSessionRequest): Promise<AvatarRealtimeSessionResponse>;
  generatePregeneratedVideo(request: AvatarVideoGenerationRequest): Promise<AvatarVideoGenerationResponse>;
}

export interface IAvatarService {
  listAvatarProfiles(): Promise<AvatarProfile[]>;
  startRealtimeAvatar(request: AvatarRealtimeSessionRequest): Promise<AvatarRealtimeSessionResponse>;
  renderEducationalVideo(request: AvatarVideoGenerationRequest): Promise<AvatarVideoGenerationResponse>;
}
