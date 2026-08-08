/**
 * JiuSpeak AI - ElevenLabs Text To Speech Adapter
 * Handles server-side audio synthesis with timeout, retry, quota handling, and voiceId selection
 */

import { ITtsAdapter, TextToSpeechRequest, TextToSpeechResponse } from '../tts.interface';

export class ElevenLabsTtsAdapter implements ITtsAdapter {
  private apiKey = process.env.ELEVENLABS_API_KEY || '';
  private defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default Rachel / Prof Marcos voice

  getProviderName(): string {
    return this.apiKey ? 'ElevenLabs (Official Configured)' : 'ElevenLabs (Unconfigured / Missing API Key)';
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    const voiceId = request.voiceId || this.defaultVoiceId;

    if (!request.text || request.text.trim() === '') {
      throw new Error('Texto para síntese de voz é obrigatório.');
    }

    if (this.apiKey) {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': this.apiKey,
            },
            body: JSON.stringify({
              text: request.text,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: request.stability ?? 0.5,
                similarity_boost: request.similarityBoost ?? 0.75,
              },
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
            return {
              audioBase64,
              audioUrl: `data:audio/mp3;base64,${audioBase64}`,
              durationSeconds: Math.ceil(request.text.length / 15),
              voiceProvider: 'ElevenLabs',
              voiceIdUsed: voiceId,
            };
          } else if (response.status === 429) {
            console.warn(`ElevenLabs TTS rate limit hit (Attempt ${attempts}/${maxAttempts}). Waiting...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else if (response.status === 401 || response.status === 403) {
            console.error('ElevenLabs API Key invalid or quota exceeded:', response.statusText);
            break;
          }
        } catch (err) {
          console.warn(`ElevenLabs TTS attempt ${attempts} failed:`, err);
        }
      }
    }

    // Unconfigured API Key or Quota Exceeded Response
    return {
      audioBase64: '',
      audioUrl: '',
      durationSeconds: Math.ceil(request.text.length / 15),
      voiceProvider: 'Unconfigured / Fallback Mode',
      voiceIdUsed: voiceId,
    };
  }
}
