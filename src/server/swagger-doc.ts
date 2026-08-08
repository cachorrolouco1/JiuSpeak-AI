/**
 * JiuSpeak AI - OpenAPI / Swagger 3.0 Specification
 * Prepared for future integration into JiuSpeak main website
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'JiuSpeak AI API',
    version: '1.0.0',
    description: 'API Educacional de Inteligência Artificial para Ensino de Inglês aplicado ao Brazilian Jiu-Jitsu.',
  },
  servers: [
    {
      url: '/api',
      description: 'JiuSpeak AI Cloud Gateway',
    },
  ],
  paths: {
    '/ai/chat': {
      post: {
        summary: 'Enviar mensagem de chat para a JiuSpeak AI',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  studentId: { type: 'string', example: 'std-carlos-123' },
                  message: { type: 'string', example: 'I am training BJJ since two years.' },
                  mode: { type: 'string', enum: ['text', 'voice', 'avatar_realtime', 'avatar_video'] },
                  bjjScenario: { type: 'string', example: 'DRILLING' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Resposta pedagógica com correções e áudio/vídeo gerado' },
        },
      },
    },
    '/ai/student/{id}': {
      get: {
        summary: 'Obter perfil completo do aluno',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Perfil e nível no BJJ/Inglês' } },
      },
    },
    '/ai/student/{id}/progress': {
      get: {
        summary: 'Obter progresso educacional nas 6 dimensões',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Notas de Grammar, Vocabulary, Fluency, Comprehension, Context, Pronunciation' } },
      },
    },
    '/ai/student/{id}/memory': {
      get: {
        summary: 'Obter memória contextual do aluno (Short-term, Episodic, Semantic, Errors)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Memória em camadas do aluno' } },
      },
    },
    '/ai/evaluate': {
      post: {
        summary: 'Avaliação educacional detalhada de um texto ou áudio',
        responses: { '200': { description: 'Resultado da avaliação pedagógica' } },
      },
    },
    '/ai/exercise': {
      post: {
        summary: 'Avaliar resposta de exercício prático de BJJ',
        responses: { '200': { description: 'Pontuação e gabarito com explicação' } },
      },
    },
    '/ai/voice/stt': {
      post: {
        summary: 'Reconhecimento de fala em áudio (STT)',
        responses: { '200': { description: 'Transcrição do áudio' } },
      },
    },
    '/ai/voice/tts': {
      post: {
        summary: 'Sintetização de voz com ElevenLabs (TTS)',
        responses: { '200': { description: 'Áudio sintetizado' } },
      },
    },
    '/ai/avatar/generate-video': {
      post: {
        summary: 'Gerar vídeo do Professor Virtual com síntese de voz e lip sync',
        responses: { '200': { description: 'URL do vídeo gerado' } },
      },
    },
  },
};
