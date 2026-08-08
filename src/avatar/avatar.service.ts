/**
 * JiuSpeak AI - Avatar Service Orchestrator
 */

import { IAvatarService, IAvatarAdapter } from '../core/interfaces/avatar-service.interface';
import {
  AvatarProfile,
  AvatarRealtimeSessionRequest,
  AvatarRealtimeSessionResponse,
  AvatarVideoGenerationRequest,
  AvatarVideoGenerationResponse,
} from '../core/types/avatar.types';

export class AvatarService implements IAvatarService {
  constructor(private adapter: IAvatarAdapter) {}

  async listAvatarProfiles(): Promise<AvatarProfile[]> {
    return this.adapter.getAvailableAvatars();
  }

  async startRealtimeAvatar(
    request: AvatarRealtimeSessionRequest
  ): Promise<AvatarRealtimeSessionResponse> {
    return this.adapter.createRealtimeSession(request);
  }

  async renderEducationalVideo(
    request: AvatarVideoGenerationRequest
  ): Promise<AvatarVideoGenerationResponse> {
    return this.adapter.generatePregeneratedVideo(request);
  }
}
