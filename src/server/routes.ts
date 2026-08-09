/**
 * JiuSpeak AI - Complete REST API Router
 * Implements all endpoints required for JiuSpeak platform integration
 */

import * as fs from 'fs';
import * as path from 'path';
import { getFullStudentContext } from '../db/student-context';
import { getActiveRooms } from './live-socket';
import { createTalkingVideo } from '../tts/did-avatar';
import { Router, Request, Response } from 'express';
import { GeminiModelAdapter } from '../ai-core/gemini.adapter';
import { AICoreOrchestrator } from '../ai-core/ai-core.orchestrator';
import { MemoryService } from '../memory/memory.service';
import { RAGKnowledgeService } from '../knowledge/rag.service';
import { EducationalEngine } from '../educational/educational.engine';
import { ElevenLabsSttAdapter } from '../voice/stt/adapters/elevenlabs-stt.adapter';
import { SpeechToTextService } from '../voice/stt/stt.service';
import { ElevenLabsTtsAdapter } from '../voice/tts/adapters/elevenlabs-tts.adapter';
import { TextToSpeechService } from '../voice/tts/tts.service';
import { VoiceService } from '../voice/voice.service';
import { PronunciationAdapter } from '../pronunciation/pronunciation.adapter';
import { PronunciationService } from '../pronunciation/pronunciation.service';
import { AvatarAdapter } from '../avatar/avatar.adapter';
import { AvatarService } from '../avatar/avatar.service';
import { dbRepository } from '../db/repository';
import { swaggerSpec } from './swagger-doc';
import { AuthenticationService } from './auth.service';

const router = Router();

// Instantiate Clean Architecture Services
const modelAdapter = new GeminiModelAdapter();
const aiCore = new AICoreOrchestrator(modelAdapter);
const memoryService = new MemoryService();
const ragService = new RAGKnowledgeService();
const educationalEngine = new EducationalEngine();

const sttAdapter = new ElevenLabsSttAdapter();
const sttService = new SpeechToTextService(sttAdapter);

const ttsAdapter = new ElevenLabsTtsAdapter();
const ttsService = new TextToSpeechService(ttsAdapter);

const voiceService = new VoiceService(sttService, ttsService);
const pronunciationAdapter = new PronunciationAdapter();
const pronunciationService = new PronunciationService(pronunciationAdapter);
const avatarAdapter = new AvatarAdapter();
const avatarService = new AvatarService(avatarAdapter);

// 0. POST /api/auth/login - Authentication
router.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const auth = AuthenticationService.authenticateUser(email);
  return res.json({ success: true, data: auth });
});

// 1. POST /api/ai/chat - Primary Multi-modal Chat Endpoint
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const studentId = req.body.studentId || 'std-carlos-123';
    const teacherId = req.body.teacherId || 'marcos';
    const { message, conversationId, mode = 'text', audioBase64, bjjScenario, avatarId } = req.body;

    if (!message && !audioBase64) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Mensagem de texto ou áudio é obrigatória.' } });
    }

    // Resolve teacher entity securely on backend (resolves teacherId -> systemInstructions + secret voiceId)
    const teacher = await dbRepository.getTeacherById(teacherId);

    let userMessageText = message || '';

    // Handle Voice STT if audio supplied
    if (audioBase64) {
      try {
        const stt = await voiceService.transcribeAudio({ audioBase64 });
        userMessageText = stt.transcript;
      } catch (sttErr: any) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_AUDIO', message: sttErr.message } });
      }
    }

    // Retrieve Memory Context
    const memoryContext = await memoryService.getStudentMemoryContext(studentId, conversationId);

    // Search RAG Knowledge Base
    const ragResults = await ragService.searchKnowledge({ query: userMessageText });
    const ragContent = ragResults.map((r) => `${r.title}\n${r.content}`).join('\n\n');

    // Buscar contexto completo do aluno no PostgreSQL do JiuSpeak
    let studentContextText = "";
    try {
      const ctx = await getFullStudentContext(studentId);
      if (ctx) {
        studentContextText = ctx.contextText;
        console.log("📋 Student context loaded:", studentContextText.substring(0, 200));
      }
    } catch (e) { console.warn("Student context fetch failed:", e); }

    // Retrieve Conversation History from SQLite
    const convId = conversationId || `conv-${Date.now()}`;
    const historyMessages = await dbRepository.getMessagesByConversation(convId);

    // Process Message through AI Core with selected Teacher
    const aiResult = await aiCore.processChatMessage(
      studentId,
      userMessageText,
      historyMessages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        mode: m.hasPedagogicalFeedback ? 'text' : 'text',
        createdAt: m.createdAt,
      })),
      memoryContext,
      bjjScenario,
      ragContent + "\n\n" + studentContextText,
      teacher
    );

    // If pedagogical error detected, record in student memory
    if (aiResult.pedagogicalFeedback?.hasError) {
      await memoryService.recordLearningError(
        studentId,
        aiResult.pedagogicalFeedback.detectedError || 'Grammar error',
        userMessageText,
        aiResult.pedagogicalFeedback.correctFormEn || '',
        aiResult.pedagogicalFeedback.category || 'GRAMMAR'
      );
    }

    // Generate Audio output via ElevenLabs using teacher.voiceId securely resolved on server
    let generatedAudioUrl: string | undefined;
    let voiceNotice: string | undefined;

    if (mode === 'voice' || mode === 'avatar_realtime' || mode === 'avatar_video') {
      if (!teacher.voiceConfigured || !teacher.voiceId || teacher.voiceId.trim() === '' || teacher.voiceId === '[AGUARDANDO CONFIGURAÇÃO]') {
        voiceNotice = `⚠️ Voice ID não configurada para ${teacher.name}. A voz do professor requer cadastro de Voice ID do ElevenLabs na área de Administração.`;
      } else {
        const tts = await voiceService.synthesizeSpeech({
          text: aiResult.assistantResponseText,
          voiceId: teacher.voiceId,
        });
        if (tts.audioUrl) {
          generatedAudioUrl = tts.audioUrl;
        } else {
          voiceNotice = `⚠️ Falha ao sintetizar áudio. Verifique se a ELEVENLABS_API_KEY do servidor está válida.`;
        }
      }
    }

    // Generate Avatar Video via D-ID (lip-sync real com foto do professor + áudio ElevenLabs)
    let generatedVideoUrl: string | undefined | null;
    if (generatedAudioUrl && teacher) {
      try {
        const teacherImage = teacher.id === 'carol' ? 'https://ai.jiuspeak.com.br/teachers/carol.jpg' : 'https://ai.jiuspeak.com.br/teachers/marcos.jpg';
        const videoUrl = await createTalkingVideo(teacherImage, generatedAudioUrl);
        if (videoUrl) generatedVideoUrl = videoUrl;
      } catch (e) { console.warn('D-ID video generation failed:', e); }
    }

    // Save user message to SQL repository
    const userMsgId = `msg-usr-${Date.now()}`;
    await dbRepository.addMessage({
      id: userMsgId,
      conversationId: convId,
      role: 'user',
      content: userMessageText,
      hasPedagogicalFeedback: false,
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
    });

    // Save assistant message to SQL repository
    const assistantMsgId = `msg-ast-${Date.now()}`;
    await dbRepository.addMessage({
      id: assistantMsgId,
      conversationId: convId,
      role: 'assistant',
      content: aiResult.assistantResponseText,
      generatedAudioUrl: generatedAudioUrl || undefined,
      generatedVideoUrl: generatedVideoUrl || undefined,
      hasPedagogicalFeedback: !!aiResult.pedagogicalFeedback?.hasError,
      pedagogicalFeedbackJson: JSON.stringify(aiResult.pedagogicalFeedback),
      tokensUsed: aiResult.costEstimate.tokens.totalTokens,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      data: {
        conversationId: convId,
        userMessage: { id: userMsgId, conversationId: convId, role: 'user', content: userMessageText, mode, createdAt: new Date().toISOString() },
        assistantMessage: {
          id: assistantMsgId,
          conversationId: convId,
          role: 'assistant',
          content: aiResult.assistantResponseText,
          generatedAudioUrl,
          generatedVideoUrl,
          pedagogicalFeedback: aiResult.pedagogicalFeedback,
          mode,
          createdAt: new Date().toISOString(),
          tokensUsed: aiResult.costEstimate.tokens.totalTokens,
        },
        pedagogicalFeedback: aiResult.pedagogicalFeedback,
        audioUrl: generatedAudioUrl,
        videoUrl: generatedVideoUrl,
        voiceNotice,
        tokensUsed: aiResult.costEstimate.tokens.totalTokens,
        estimatedCostUsd: aiResult.costEstimate.estimatedCostUsd,
      },
      meta: {
        timestamp: new Date().toISOString(),
        durationMs: aiResult.costEstimate.durationMs,
        tokensUsed: aiResult.costEstimate.tokens.totalTokens,
        estimatedCostUsd: aiResult.costEstimate.estimatedCostUsd,
      },
    });
  } catch (err: any) {
    console.error('API /chat error:', err);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message || 'Erro interno do servidor.' } });
  }
});

// 2. GET /api/ai/student/:id - Fetch Student Profile
router.get('/student/:id', async (req: Request, res: Response) => {
  const profile = await dbRepository.getStudentProfile(req.params.id);
  if (!profile) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil do aluno não encontrado.' } });
  }
  return res.json({ success: true, data: profile });
});

// 3. GET /api/ai/student/:id/progress - Fetch Student Progress (6 Dimensions)
router.get('/student/:id/progress', async (req: Request, res: Response) => {
  const progress = await educationalEngine.getStudentProgress(req.params.id);
  return res.json({ success: true, data: progress });
});

// 4. GET /api/ai/student/:id/memory - Fetch Student Memory Context
router.get('/student/:id/memory', async (req: Request, res: Response) => {
  const memory = await memoryService.getStudentMemoryContext(req.params.id);
  return res.json({ success: true, data: memory });
});

// 5. POST /api/ai/evaluate - Detailed Evaluation Endpoint
router.post('/evaluate', async (req: Request, res: Response) => {
  const studentId = req.body.studentId || 'std-carlos-123';
  const { textInput, audioInputBase64, bjjContext } = req.body;

  if (!textInput && !audioInputBase64) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Input de texto ou áudio é obrigatório.' } });
  }

  const evaluation = await educationalEngine.evaluateStudentPerformance({
    studentId,
    textInput: textInput || '',
    audioInputBase64,
    bjjContext,
  });
  return res.json({ success: true, data: evaluation });
});

// 6. POST /api/ai/exercise - Exercise Evaluator
router.post('/exercise', async (req: Request, res: Response) => {
  const { exerciseId = 'ex-1', studentAnswer } = req.body;
  if (!studentAnswer) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Resposta do exercício é obrigatória.' } });
  }
  const { ExerciseGenerator } = await import('../educational/exercise-generator');
  const generator = new ExerciseGenerator();
  const result = generator.evaluateExerciseAnswer(exerciseId, studentAnswer || '');
  return res.json({ success: true, data: result });
});

// 7. POST /api/ai/voice/stt - Speech To Text
router.post('/voice/stt', async (req: Request, res: Response) => {
  const { audioBase64, language, mimeType } = req.body;
  if (!audioBase64) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Payload audioBase64 é obrigatório.' } });
  }
  try {
    const result = await voiceService.transcribeAudio({ audioBase64, language, mimeType });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: { code: 'STT_FAILED', message: err.message } });
  }
});

// 8. POST /api/ai/voice/tts - Text To Speech
router.post('/voice/tts', async (req: Request, res: Response) => {
  const { text, voiceId } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Texto para síntese é obrigatório.' } });
  }
  const result = await voiceService.synthesizeSpeech({ text, voiceId });
  return res.json({ success: true, data: result });
});

// 9. POST /api/ai/avatar/generate-video - Render Video
router.post('/avatar/generate-video', async (req: Request, res: Response) => {
  const { avatarId = 'prof-jiuspeak-master', scriptText } = req.body;
  if (!scriptText) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Roteiro de texto para o avatar é obrigatório.' } });
  }
  const video = await avatarService.renderEducationalVideo({ avatarId, scriptText });
  return res.json({ success: true, data: video });
});

// 10. GET /api/ai/avatar/profiles - List Avatars
router.get('/avatar/profiles', async (req: Request, res: Response) => {
  const avatars = await avatarService.listAvatarProfiles();
  return res.json({ success: true, data: avatars });
});

// 11. GET /api/ai/knowledge/search - Search Knowledge Base
router.get('/knowledge/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Parâmetro de busca ?q= é obrigatório.' } });
  }
  const results = await ragService.searchKnowledge({ query });
  return res.json({ success: true, data: results });
});

// 12. GET /api/ai/teachers - List Public Profiles of Official Teachers (no secret Voice IDs exposed)
router.get('/teachers', async (req: Request, res: Response) => {
  try {
    const teachers = await dbRepository.getPublicTeachers();
    return res.json({ success: true, data: teachers });
  } catch (err: any) {
    console.error('Error in /api/ai/teachers:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro ao buscar professores.' });
  }
});

// 13. GET /api/ai/teachers/:id - Get Single Public Teacher Profile
router.get('/teachers/:id', async (req: Request, res: Response) => {
  try {
    const teacher = await dbRepository.getTeacherById(req.params.id);
    const publicTeacher = {
      id: teacher.id,
      name: teacher.name,
      gender: teacher.gender,
      titlePt: teacher.titlePt,
      descriptionPt: teacher.descriptionPt,
      avatarImageUrl: teacher.avatarImageUrl,
      voiceProvider: teacher.voiceProvider,
      voiceConfigured: teacher.voiceConfigured,
      personality: teacher.personality,
      teachingStyle: teacher.teachingStyle,
      active: teacher.active,
    };
    return res.json({ success: true, data: publicTeacher });
  } catch (err: any) {
    console.error('Error in /api/ai/teachers/:id:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro ao buscar dados do professor.' });
  }
});

// 14. GET /api/ai/admin/teachers - Full Admin Configuration list of Teachers
router.get('/admin/teachers', async (req: Request, res: Response) => {
  try {
    const teachers = await dbRepository.getTeachers();
    return res.json({
      success: true,
      data: teachers.map((t) => ({
        id: t.id,
        name: t.name,
        gender: t.gender,
        titlePt: t.titlePt,
        voiceProvider: t.voiceProvider,
        voiceId: t.voiceId,
        voiceConfigured: t.voiceConfigured,
        updatedAt: t.updatedAt,
      })),
      elevenLabsApiKeyConfigured: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.trim() !== ''),
    });
  } catch (err: any) {
    console.error('Error in /api/ai/admin/teachers:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro ao carregar lista de administração dos professores.' });
  }
});

// 15. POST /api/ai/admin/teachers/:id/voice-config - Secure Admin Voice ID Configuration for a Single Teacher
router.post('/admin/teachers/:id/voice-config', async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id;
    const newVoiceId = (req.body.voiceId || '').trim();

    const allTeachers = await dbRepository.getTeachers();
    const currentTeacher = allTeachers.find((t) => t.id === teacherId);

    if (!currentTeacher) {
      return res.status(404).json({ success: false, error: `Professor ${teacherId} não encontrado.` });
    }

    // Validate duplicate Voice ID across teachers
    if (newVoiceId !== '') {
      const duplicateTeacher = allTeachers.find((t) => t.id !== teacherId && t.voiceId && t.voiceId.trim() === newVoiceId);
      if (duplicateTeacher) {
        return res.status(400).json({
          success: false,
          error: `Validação de segurança falhou: A Voice ID "${newVoiceId}" já está atribuída ao(à) ${duplicateTeacher.name}. Cada professor deve ter uma Voice ID exclusiva do ElevenLabs.`,
        });
      }
    }

    const updatedTeacher = {
      ...currentTeacher,
      voiceId: newVoiceId,
      voiceConfigured: Boolean(newVoiceId !== '' && newVoiceId !== '[AGUARDANDO CONFIGURAÇÃO]'),
      updatedAt: new Date().toISOString(),
    };

    await dbRepository.saveTeacher(updatedTeacher);

    return res.json({
      success: true,
      message: `Voice ID do(a) ${updatedTeacher.name} atualizada com sucesso no banco de dados.`,
      data: {
        id: updatedTeacher.id,
        name: updatedTeacher.name,
        voiceId: updatedTeacher.voiceId,
        voiceConfigured: updatedTeacher.voiceConfigured,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/ai/admin/teachers/:id/voice-config:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro ao salvar Voice ID do professor.' });
  }
});

// 16. POST /api/ai/admin/teachers/voice-config/batch - Batch Save Voice IDs for Both Marcos and Carol
router.post('/admin/teachers/voice-config/batch', async (req: Request, res: Response) => {
  try {
    const { marcosVoiceId = '', carolVoiceId = '' } = req.body;

    const marcosIdTrimmed = marcosVoiceId.trim();
    const carolIdTrimmed = carolVoiceId.trim();

    // Validate duplicate Voice ID
    if (marcosIdTrimmed !== '' && carolIdTrimmed !== '' && marcosIdTrimmed === carolIdTrimmed) {
      return res.status(400).json({
        success: false,
        error: `Validação recusada: O Professor Marcos e a Professora Carol não podem compartilhar a mesma Voice ID ("${marcosIdTrimmed}"). Por favor, atribua uma Voice ID exclusiva masculina para o Professor Marcos e uma exclusiva feminina para a Professora Carol.`,
      });
    }

    // Save Marcos
    const marcos = await dbRepository.getTeacherById('marcos');
    marcos.voiceId = marcosIdTrimmed;
    marcos.voiceConfigured = Boolean(marcosIdTrimmed !== '' && marcosIdTrimmed !== '[AGUARDANDO CONFIGURAÇÃO]');
    await dbRepository.saveTeacher(marcos);

    // Save Carol
    const carol = await dbRepository.getTeacherById('carol');
    carol.voiceId = carolIdTrimmed;
    carol.voiceConfigured = Boolean(carolIdTrimmed !== '' && carolIdTrimmed !== '[AGUARDANDO CONFIGURAÇÃO]');
    await dbRepository.saveTeacher(carol);

    return res.json({
      success: true,
      message: 'Voice IDs dos professores salvas com sucesso!',
      data: {
        marcos: { id: marcos.id, name: marcos.name, voiceConfigured: marcos.voiceConfigured },
        carol: { id: carol.id, name: carol.name, voiceConfigured: carol.voiceConfigured },
      },
    });
  } catch (err: any) {
    console.error('Error in /api/ai/admin/teachers/voice-config/batch:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro ao salvar configurações de voz em lote.' });
  }
});

// 15. GET /api/ai/swagger.json - OpenAPI Spec
router.get('/swagger.json', (req: Request, res: Response) => {
  res.json(swaggerSpec);
});

// GET active live rooms
router.get('/live-rooms', (req, res) => {
  res.json({ success: true, rooms: getActiveRooms() });
});

// GET active live rooms
router.get('/live-rooms', (req, res) => {
  res.json({ success: true, rooms: getActiveRooms() });
});

export default router;
