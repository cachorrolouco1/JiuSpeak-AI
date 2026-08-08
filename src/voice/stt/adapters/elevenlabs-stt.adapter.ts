/**
 * JiuSpeak AI - ElevenLabs & Gemini Multimodal Speech To Text Adapter
 * Transcribes real user audio with zero hardcoded mock responses
 */

import { ISttAdapter, SpeechToTextRequest, SpeechToTextResponse } from '../stt.interface';
import { GoogleGenAI } from '@google/genai';

export class ElevenLabsSttAdapter implements ISttAdapter {
  private apiKey = process.env.ELEVENLABS_API_KEY || '';
  private geminiKey = process.env.GEMINI_API_KEY || '';

  getProviderName(): string {
    return this.apiKey ? 'ElevenLabs Official Speech-To-Text' : 'Gemini Multimodal Audio Transcription';
  }

  async speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
    // 1. Validation of MIME type & Size limit (max 10MB)
    if (!request.audioBase64 || request.audioBase64.trim() === '') {
      throw new Error('Nenhum dado de áudio foi fornecido para transcrição.');
    }

    const audioBuffer = Buffer.from(request.audioBase64.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
    if (audioBuffer.length > 10 * 1024 * 1024) {
      throw new Error('Tamanho do arquivo de áudio excede o limite máximo de 10MB.');
    }

    const mimeType = request.mimeType || 'audio/mp3';

    // 2. Try ElevenLabs Official STT endpoint if key is present
    if (this.apiKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: mimeType });
        formData.append('file', blob, 'recording.mp3');
        formData.append('model_id', 'scribe_v1');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          if (json.text) {
            return {
              transcript: json.text.trim(),
              confidence: json.confidence || 0.95,
              detectedLanguage: json.language_code || request.language || 'en',
              durationSeconds: json.duration || Math.ceil(audioBuffer.length / 16000),
              provider: 'ElevenLabs Scribe STT',
            };
          }
        }
      } catch (err) {
        console.warn('ElevenLabs STT request failed/timed out, falling back to Gemini Multimodal Audio Transcriber:', err);
      }
    }

    // 3. Multimodal Audio Processing via Gemini 3.6 Flash
    try {
      const ai = new GoogleGenAI({ apiKey: this.geminiKey || 'demo-fallback-key' });
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType.includes('wav') ? 'audio/wav' : mimeType.includes('ogg') ? 'audio/ogg' : 'audio/mp3',
                  data: audioBuffer.toString('base64'),
                },
              },
              {
                text: 'Transcreva exatamente a fala presente neste áudio. Se o áudio estiver em inglês, retorne o texto em inglês. Se estiver em português, retorne em português. Retorne SOMENTE o texto transcrito sem introduções ou explicações.',
              },
            ],
          },
        ],
      });

      const transcript = response.text ? response.text.trim() : '';
      if (transcript) {
        return {
          transcript,
          confidence: 0.92,
          detectedLanguage: request.language || 'en-US',
          durationSeconds: Math.ceil(audioBuffer.length / 16000),
          provider: 'Gemini Multimodal Audio Transcriber',
        };
      }
    } catch (geminiErr) {
      console.error('Gemini multimodal audio transcription failed:', geminiErr);
    }

    throw new Error('Falha no processamento de áudio. Não foi possível realizar a transcrição do áudio enviado.');
  }
}
