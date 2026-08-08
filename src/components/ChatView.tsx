import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Video,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Zap,
  DollarSign,
  Cpu,
  User,
  Bot,
  Play,
  Square,
} from 'lucide-react';
import { ChatMessage, InteractionMode } from '../core/types/chat.types';
import { BJJ_SCENARIOS, OFFICIAL_AVATARS } from '../core/entities/bjj.constants';

interface ChatViewProps {
  studentId: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ studentId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('drilling-pass');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('text');
  const [selectedTeacherId, setSelectedTeacherId] = useState<'marcos' | 'carol'>('marcos');
  const [teachers, setTeachers] = useState<any[]>([
    {
      id: 'marcos',
      name: 'Professor Marcos',
      gender: 'MALE',
      titlePt: 'Professor Head Instructor',
      descriptionPt: 'Especialista em passagens, regramento e coaching internacional.',
      avatarImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'carol',
      name: 'Professora Carol',
      gender: 'FEMALE',
      titlePt: 'Professora de BJJ & Inglês Instrumental',
      descriptionPt: 'Especialista em fluência sob pressão, arbitragem e campeonatos.',
      avatarImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
  ]);

  useEffect(() => {
    // Fetch public teacher profiles from server
    fetch('/api/ai/teachers')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.length) {
          setTeachers(json.data);
        }
      })
      .catch((err) => console.error('Failed to fetch teachers:', err));
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [conversationId] = useState<string>(`conv-${Date.now()}`);
  
  // Real Audio Recorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Observability & Cost State
  const [lastTokenUsage, setLastTokenUsage] = useState<number | null>(null);
  const [lastCostUsd, setLastCostUsd] = useState<number | null>(null);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: 'msg-welcome',
        conversationId,
        role: 'assistant',
        content:
          'Oss, Carlos! Sou o Professor Marcos do JiuSpeak AI. Hoje vamos praticar diálogos técnicos de Jiu-Jitsu em inglês. Escolha um cenário acima (ex: Drilling, Sparring ou Comandos de Árbitro) e mande sua mensagem por texto ou grave seu áudio real!',
        mode: 'text',
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Start Real Browser Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          handleSendMessage('', base64Audio);
        };
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Permissão de microfone negada ou indisponível no navegador.');
    }
  };

  // Stop Real Browser Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSendMessage = async (customText?: string, audioBase64Input?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() && !audioBase64Input) return;

    const userMsgId = `usr-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      conversationId,
      role: 'user',
      content: textToSend || '🎤 [Áudio de voz real gravado e enviado]',
      mode: interactionMode,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!customText && !audioBase64Input) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-student-id': studentId,
        },
        body: JSON.stringify({
          studentId,
          teacherId: selectedTeacherId,
          conversationId,
          message: textToSend,
          mode: interactionMode,
          bjjScenario: selectedScenario,
          audioBase64: audioBase64Input,
        }),
      });

      const json = await response.json();

      if (json.success && json.data) {
        const assistantMsg: ChatMessage = {
          id: json.data.assistantMessage.id,
          conversationId: json.data.conversationId,
          role: 'assistant',
          content: json.data.assistantMessage.content,
          generatedAudioUrl: json.data.audioUrl,
          generatedVideoUrl: json.data.videoUrl,
          pedagogicalFeedback: json.data.pedagogicalFeedback,
          mode: json.data.assistantMessage.mode,
          createdAt: json.data.assistantMessage.createdAt,
          tokensUsed: json.data.tokensUsed,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setLastTokenUsage(json.data.tokensUsed);
        setLastCostUsd(json.data.estimatedCostUsd);
        setLastDurationMs(json.meta?.durationMs || 450);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
  const activeScenarioObj = BJJ_SCENARIOS.find((s) => s.id === selectedScenario);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Top Controls: Scenarios & Mode Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Scenario Selector (Horizontal scrollable on mobile) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Cenário de Jiu-Jitsu Ativo</h2>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
              Contexto BJJ
            </span>
          </div>

          <div className="flex sm:grid sm:grid-cols-4 gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {BJJ_SCENARIOS.map((scenario) => {
              const isSelected = selectedScenario === scenario.id;
              return (
                <button
                  key={scenario.id}
                  id={`scenario-btn-${scenario.id}`}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`min-w-[130px] sm:min-w-0 min-h-[44px] p-2 rounded-xl border text-left transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold truncate text-amber-300">{scenario.title}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{scenario.descriptionPt}</p>
                </button>
              );
            })}
          </div>

          {activeScenarioObj && (
            <div className="mt-2.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Início sugerido:</span>
              <button
                onClick={() => setInputText(activeScenarioObj.suggestedStarterEn)}
                className="font-medium text-amber-400 hover:underline truncate max-w-[220px] sm:max-w-none"
              >
                "{activeScenarioObj.suggestedStarterEn}"
              </button>
            </div>
          )}
        </div>

        {/* Interaction Mode & Teacher Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Modo de Interação</h2>
              <span className="text-[10px] text-amber-400 font-medium">{currentTeacher?.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="mode-btn-text"
                onClick={() => setInteractionMode('text')}
                className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                  interactionMode === 'text'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Texto</span>
              </button>

              <button
                id="mode-btn-voice"
                onClick={() => setInteractionMode('voice')}
                className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                  interactionMode === 'voice'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voz</span>
              </button>

              <button
                id="mode-btn-realtime"
                onClick={() => setInteractionMode('avatar_realtime')}
                className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                  interactionMode === 'avatar_realtime'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Avatar Live</span>
              </button>

              <button
                id="mode-btn-video"
                onClick={() => setInteractionMode('avatar_video')}
                className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                  interactionMode === 'avatar_video'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Vídeo Aula</span>
              </button>
            </div>
          </div>

          {/* Official Teacher Selection (Professor Marcos / Professora Carol) */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Professor Oficial
              </span>
              {currentTeacher?.voiceConfigured ? (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center space-x-1">
                  <span>✓ Voice ID Pronta</span>
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 font-bold flex items-center space-x-1">
                  <span>⚠️ Voice ID não configurada</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
              <img
                src={currentTeacher?.avatarImageUrl}
                alt={currentTeacher?.name}
                className="w-9 h-9 rounded-full object-cover border border-amber-500/50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentTeacher?.name}</p>
                <p className="text-[10px] text-amber-400 truncate">{currentTeacher?.titlePt}</p>
              </div>
              <select
                id="select-teacher"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value as 'marcos' | 'carol')}
                className="bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300 rounded-lg p-1.5 min-h-[36px] focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.voiceConfigured ? '✓ Voz OK' : '⚠️ Sem Voz'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Stream Container (Responsive Height) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[calc(100vh-280px)] min-h-[420px] md:h-[620px]">
        {/* Chat Stream Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] sm:max-w-2xl rounded-2xl p-3 sm:p-4 shadow-lg ${isUser ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-950 text-slate-100 border border-slate-800 rounded-tl-none'}`}>
                  {/* Sender Header */}
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-black/10 dark:border-white/10 text-xs">
                    <span className="font-bold flex items-center space-x-1.5">
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{isUser ? 'Carlos (Aluno)' : currentTeacher?.name || 'Professor'}</span>
                    </span>
                    <span className="text-[10px] opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Content */}
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Avatar Video Output if generated */}
                  {msg.generatedVideoUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-amber-500/30 bg-black">
                      <div className="p-2 bg-slate-900 text-xs font-bold text-amber-300 flex items-center space-x-2">
                        <Video className="w-3.5 h-3.5" />
                        <span>Vídeo-Aula do Professor Virtual</span>
                      </div>
                      <video src={msg.generatedVideoUrl} controls className="w-full h-44 object-cover" />
                    </div>
                  )}

                  {/* Audio Synthesized Playback */}
                  {msg.generatedAudioUrl && !msg.generatedVideoUrl && (
                    <div className="mt-2.5 p-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center space-x-3">
                      <button
                        onClick={() => {
                          const audio = new Audio(msg.generatedAudioUrl);
                          audio.play();
                        }}
                        className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center hover:scale-105 transition-all"
                      >
                        <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                      </button>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-amber-300">Sintetizador ElevenLabs HD</p>
                        <p className="text-[10px] text-slate-400">Ouvir voz do professor virtual</p>
                      </div>
                    </div>
                  )}

                  {/* Embedded Pedagogical Feedback Card */}
                  {msg.pedagogicalFeedback && msg.pedagogicalFeedback.hasError && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-100 text-xs space-y-2">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Correção Pedagógica JiuSpeak AI:</span>
                      </div>

                      {msg.pedagogicalFeedback.detectedError && (
                        <div>
                          <span className="text-slate-400 font-medium">Sua frase: </span>
                          <span className="line-through text-red-300">{msg.pedagogicalFeedback.detectedError}</span>
                        </div>
                      )}

                      {msg.pedagogicalFeedback.correctFormEn && (
                        <div>
                          <span className="text-slate-400 font-medium">Forma Natural (BJJ English): </span>
                          <span className="font-bold text-emerald-300">{msg.pedagogicalFeedback.correctFormEn}</span>
                        </div>
                      )}

                      {msg.pedagogicalFeedback.explanationPt && (
                        <p className="text-slate-300 leading-normal bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          {msg.pedagogicalFeedback.explanationPt}
                        </p>
                      )}

                      {msg.pedagogicalFeedback.suggestedRetry && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-amber-300 font-semibold">{msg.pedagogicalFeedback.suggestedRetry}</span>
                          <button
                            onClick={() => setInputText(msg.pedagogicalFeedback?.correctFormEn || '')}
                            className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded text-[10px] hover:bg-amber-400 transition-all min-h-[32px]"
                          >
                            Copiar para praticar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-950 border border-slate-800 p-3 sm:p-4 rounded-2xl rounded-tl-none flex items-center space-x-3 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>JiuSpeak AI está analisando gramática e gerando resposta...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Controls */}
        <div className="p-2 sm:p-3 bg-slate-950 border-t border-slate-800 rounded-b-2xl space-y-2">
          {isRecording && (
            <div className="bg-red-950/60 border border-red-500/40 p-2 rounded-xl flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-bold">Gravando voz ao vivo ({recordingTime}s)</span>
              </div>
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-lg flex items-center space-x-1"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Concluir & Enviar</span>
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Real Audio Recorder Toggle */}
            <button
              type="button"
              id="btn-voice-record"
              onClick={isRecording ? stopRecording : startRecording}
              className={`min-h-[44px] px-3 rounded-xl border transition-all flex items-center justify-center ${
                isRecording
                  ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-lg shadow-red-600/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
              title={isRecording ? 'Parar gravação de voz' : 'Iniciar gravação de voz real'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
            </button>

            <input
              id="input-chat-message"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem em inglês (ex: How do I escape the back control?)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all min-h-[44px]"
            />

            <button
              id="btn-send-message"
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold px-3 sm:px-4 py-2.5 rounded-xl text-xs transition-all flex items-center space-x-1.5 min-h-[44px]"
            >
              <span className="hidden sm:inline">Enviar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Observability & Cost Tracker Bar */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 px-1 pt-1 border-t border-slate-900">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="flex items-center space-x-1 text-slate-400">
                <Cpu className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Modelo: </span>
                <span>Gemini 3.6 Flash</span>
              </span>
              {lastTokenUsage && (
                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                  {lastTokenUsage} tok
                </span>
              )}
              {lastDurationMs && (
                <span className="text-slate-400 hidden sm:inline">
                  {lastDurationMs}ms
                </span>
              )}
            </div>

            {lastCostUsd !== null && (
              <div className="flex items-center space-x-1 text-emerald-400 font-mono font-medium">
                <DollarSign className="w-3 h-3" />
                <span>${lastCostUsd.toFixed(6)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
