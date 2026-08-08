/**
 * JiuSpeak AI - Gemini Model Adapter
 * Implements IModelAdapter using @google/genai SDK
 */

import { GoogleGenAI } from '@google/genai';
import { IModelAdapter, ModelPromptOptions, ModelResponse } from '../core/interfaces/model-adapter.interface';

export class GeminiModelAdapter implements IModelAdapter {
  private aiClient: GoogleGenAI | null = null;
  private defaultModel = 'gemini-3.6-flash';

  private getClient(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY is not defined or invalid. Initializing with fallback mode.');
      }
      this.aiClient = new GoogleGenAI({
        apiKey: apiKey || 'demo-fallback-key',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.aiClient;
  }

  async generateText(prompt: string, options: ModelPromptOptions): Promise<ModelResponse> {
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: this.defaultModel,
        contents: prompt,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 1024,
          ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
        },
      });

      const text = response.text || '';
      const usage = response.usageMetadata;

      return {
        text,
        promptTokens: usage?.promptTokenCount ?? Math.ceil(prompt.length / 4),
        responseTokens: usage?.candidatesTokenCount ?? Math.ceil(text.length / 4),
        totalTokens: usage?.totalTokenCount ?? (Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4)),
        modelName: this.defaultModel,
      };
    } catch (error) {
      console.warn('Gemini API call returned an error, using safety fallback response:', (error as Error).message);

      const isJsonRequest = options.responseMimeType === 'application/json' || prompt.includes('Respond ONLY with a valid JSON');

      const fallbackText = isJsonRequest
        ? JSON.stringify({
            assistantResponseText: 'Oss! Sou a JiuSpeak AI. Como posso te ajudar hoje no dojo? (Modo de demonstração de fallback)',
            pedagogicalFeedback: {
              hasError: false,
              category: 'BJJ_CONTEXT',
            },
          })
        : 'Oss! Sou a JiuSpeak AI. Como posso te ajudar hoje no dojo? (Modo de demonstração de fallback)';

      return {
        text: fallbackText,
        promptTokens: Math.ceil(prompt.length / 4),
        responseTokens: Math.ceil(fallbackText.length / 4),
        totalTokens: Math.ceil(prompt.length / 4) + Math.ceil(fallbackText.length / 4),
        modelName: 'gemini-3.6-flash-fallback',
      };
    }
  }

  async generateStructuredJSON<T>(
    prompt: string,
    jsonSchemaDescription: string,
    options: ModelPromptOptions
  ): Promise<{ data: T; usage: ModelResponse }> {
    const fullPrompt = `${prompt}\n\nStrict Output Format Requirement:\nRespond ONLY with a valid JSON object strictly adhering to this description:\n${jsonSchemaDescription}\nDo not include any markdown backticks or extra commentary.`;

    const usage = await this.generateText(fullPrompt, {
      ...options,
      responseMimeType: 'application/json',
    });

    let cleanedText = usage.text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const data = JSON.parse(cleanedText) as T;
      return { data, usage };
    } catch (err) {
      const safetyFallback = {
        assistantResponseText: 'Oss! Vamos continuar praticando os diálogos de Jiu-Jitsu.',
        pedagogicalFeedback: {
          hasError: false,
          category: 'BJJ_CONTEXT',
        },
      } as unknown as T;
      return { data: safetyFallback, usage };
    }
  }
}
