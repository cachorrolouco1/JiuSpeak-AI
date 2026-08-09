import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Mic, MicOff, Phone, PhoneOff,
  Volume2, Video, VideoOff, RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  createdAt: string;
}

interface ChatViewProps {
  studentId: string;
}

// Teachers with Voice IDs and shift schedule
const TEACHERS = {
  marcos: {
    id: 'marcos',
    name: 'Professor Marcos',
    title: 'Head Instructor',
    voiceId: '4J31DrhygVjvFsoj7BsM',
    gender: 'MALE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    greeting: 'Oss! Sou o Professor Marcos. Vamos treinar seu inglês de Jiu-Jitsu? Pode falar ou digitar!',
  },
  carol: {
    id: 'carol',
    name: 'Professora Carol',
    title: 'BJJ & English Coach',
    voiceId: 'KHmfNHtEjHhLK9eER20w',
    gender: 'FEMALE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    greeting: 'Oss! Sou a Professora Carol. Vamos praticar conversação em inglês no tatame? Fala comigo!',
  },
};

type TeacherId = keyof typeof TEACHERS;

/**
 * Automatic teacher selection by shift:
 * 06:00–17:59 → Professor Marcos (turno diurno)
 * 18:00–05:59 → Professora Carol (turno noturno)
 */
function getTeacherByShift(): TeacherId {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? 'marcos' : 'carol';
}

export const ChatView: React.FC<ChatViewProps> = ({ studentId }) => {
  const [teacherId] = useState<TeacherId>(() => getTeacherByShift());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [professorVideoUrl, setProfessorVideoUrl] = useState<string | null>(null);
  const professorVideoRef = useRef<HTMLVideoElement>(null);
  const urlParams = new URLSearchParams(window.location.search);
  const studentAvatar = urlParams.get('avatar') || '';
  const studentName = urlParams.get('studentName') || 'Você';
  const [conversationId] = useState(`conv-${Date.now()}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const userStreamRef = useRef<MediaStream | null>(null);

  const teacher = TEACHERS[teacherId];

  // Welcome message
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: teacher.greeting,
      createdAt: new Date().toISOString(),
    }]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Detect live intent from text
  const detectLiveIntent = (text: string): boolean => {
    const keywords = [
      'live', 'ao vivo', 'video call', 'videochamada', 'videoconferência',
      'video conferencia', 'ligar', 'chamada', 'face to face', 'cara a cara',
      'conversar ao vivo', 'falar ao vivo', 'quero live', 'aula ao vivo',
      'vamos conversar', 'open camera', 'abrir camera', 'abrir câmera',
    ];
    const lower = text.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
  };

  // Camera controls for live mode
  const startUserCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      userStreamRef.current = stream;
      if (userVideoRef.current) userVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  const stopUserCamera = () => {
    userStreamRef.current?.getTracks().forEach(t => t.stop());
    userStreamRef.current = null;
  };

  const enterLiveMode = async () => {
    setIsLiveMode(true);
    await startUserCamera();
  };

  const exitLiveMode = () => {
    setIsLiveMode(false);
    stopUserCamera();
  };

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => handleSendMessage('', reader.result as string);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (err) {
      console.error('Mic error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Send message — AI decides response type automatically
  const handleSendMessage = async (customText?: string, audioBase64?: string) => {
    const text = customText ?? inputText;
    if (!text.trim() && !audioBase64) return;

    // Detect live intent
    if (text && detectLiveIntent(text)) {
      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() };
      const aiMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', content: 'Oss! Abrindo modo ao vivo. Pode falar comigo diretamente! 🥋🎥', createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, userMsg, aiMsg]);
      setInputText('');
      enterLiveMode();
      return;
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text || '🎤 Áudio enviado',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    if (!customText && !audioBase64) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-student-id': studentId },
        body: JSON.stringify({
          studentId,
          teacherId: teacher.id,
          teacherVoiceId: teacher.voiceId,
          conversationId,
          message: text,
          mode: audioBase64 ? 'voice' : 'text',
          audioBase64,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setIsSpeaking(true);
        const aiMsg: ChatMessage = {
          id: json.data.assistantMessage?.id || `a-${Date.now()}`,
          role: 'assistant',
          content: json.data.assistantMessage?.content || json.data.content || '',
          audioUrl: json.data.audioUrl,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMsg]);

        // Set professor video if available (D-ID lip-sync)
        if (json.data.videoUrl) {
          setProfessorVideoUrl(json.data.videoUrl);
        }

        // Auto-play voice
        if (json.data.audioUrl) {
          const audio = new Audio(json.data.audioUrl);
          audio.onended = () => setIsSpeaking(false);
          audio.play().catch(() => setIsSpeaking(false));
        } else {
          setTimeout(() => setIsSpeaking(false), 2000);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="h-full flex flex-col">

      {/* ===== PROFESSOR AREA (top 40vh) ===== */}
      <div className="flex-none relative overflow-hidden" style={{
        height: '40vh', minHeight: '200px', maxHeight: '360px',
        backgroundColor: '#0a0718',
        borderBottom: '1px solid var(--js-border)',
      }}>
        <img src={teacher.avatar} alt={teacher.name}
          className="w-full h-full object-cover transition-all duration-300"
          style={{ filter: isSpeaking ? 'brightness(1.05)' : 'brightness(0.7)' }}
        />

        {/* Gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(0deg, rgba(15,10,30,0.95) 0%, rgba(15,10,30,0.2) 50%, rgba(15,10,30,0.05) 100%)',
        }} />

        {/* Speaking glow border */}
        {isSpeaking && (
          <div className="absolute inset-0 pointer-events-none rounded-none" style={{
            boxShadow: 'inset 0 0 30px rgba(245, 158, 11, 0.15)',
            borderBottom: '2px solid var(--js-accent-amber)',
          }} />
        )}

        {/* Teacher info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h2 className="text-lg sm:text-xl font-black">{teacher.name}</h2>
          <p className="text-xs font-medium" style={{ color: 'var(--js-accent-amber)' }}>
            {teacher.title} • JiuSpeak AI
          </p>

          {/* Speaking waveform */}
          {isSpeaking && (
            <div className="flex items-center space-x-1.5 mt-1.5">
              <span className="flex space-x-[2px]">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="w-[3px] rounded-full inline-block" style={{
                    backgroundColor: 'var(--js-accent-amber)',
                    height: `${6 + Math.random() * 14}px`,
                    animation: `pulse ${0.3 + i * 0.12}s ease-in-out infinite alternate`,
                  }} />
                ))}
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--js-accent-amber)' }}>
                Falando...
              </span>
            </div>
          )}
        </div>

        {/* Shift indicator — tiny, top-right */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full backdrop-blur-md text-[9px] font-medium" style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: 'var(--js-text-muted)',
        }}>
          {teacherId === 'marcos' ? '☀️ Turno diurno' : '🌙 Turno noturno'}
        </div>
      </div>

      {/* ===== CHAT MESSAGES (middle, scrollable) ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 space-y-2.5">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-md rounded-2xl px-3.5 py-2.5 ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                style={isUser ? {
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: '#fff',
                } : {
                  backgroundColor: 'var(--js-bg-card)',
                  color: 'var(--js-text-primary)',
                  border: '1px solid var(--js-border)',
                }}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {msg.audioUrl && (
                  <button onClick={() => {
                    setIsSpeaking(true);
                    const a = new Audio(msg.audioUrl);
                    a.onended = () => setIsSpeaking(false);
                    a.play().catch(() => setIsSpeaking(false));
                  }}
                    className="mt-2 flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(245,158,11,0.15)',
                      color: 'var(--js-accent-amber)',
                      border: '1px solid rgba(245,158,11,0.3)',
                    }}>
                    <Volume2 className="w-3 h-3" />
                    <span>Ouvir</span>
                  </button>
                )}

                <span className="block text-[9px] mt-1 opacity-40 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-xs" style={{
              backgroundColor: 'var(--js-bg-card)',
              border: '1px solid var(--js-border)',
              color: 'var(--js-text-muted)',
            }}>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--js-accent-purple)' }} />
              <span>{teacher.name} está pensando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== INPUT BAR (bottom) ===== */}
      <div className="flex-none pb-safe" style={{
        backgroundColor: 'var(--js-bg-secondary)',
        borderTop: '1px solid var(--js-border)',
      }}>
        {isRecording && (
          <div className="px-3 py-2 flex items-center justify-between text-xs" style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            borderBottom: '1px solid rgba(239,68,68,0.15)',
          }}>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold" style={{ color: '#fca5a5' }}>Gravando ({recordingTime}s)</span>
            </div>
            <button onClick={stopRecording}
              className="font-bold px-3 py-1.5 rounded-lg text-xs bg-red-600 text-white">
              Enviar
            </button>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex items-center space-x-2 px-3 py-2.5">

          {/* Mic */}
          <button type="button" onClick={isRecording ? stopRecording : startRecording}
            className="flex-none w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={isRecording ? { backgroundColor: '#dc2626', color: '#fff' } : {
              backgroundColor: 'var(--js-bg-card)',
              color: 'var(--js-accent-purple-light)',
              border: '1px solid var(--js-border)',
            }}>
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Input */}
          <input type="text" value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Fale em inglês ou português..."
            className="flex-1 rounded-full px-4 py-2.5 text-sm focus:outline-none min-h-[44px]"
            style={{
              backgroundColor: 'var(--js-bg-input)',
              border: '1px solid var(--js-border)',
              color: 'var(--js-text-primary)',
            }}
          />

          {/* Live call */}
          <button type="button" onClick={() => isLiveMode ? exitLiveMode() : enterLiveMode()}
            className="flex-none w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={isLiveMode ? { backgroundColor: '#dc2626', color: '#fff' } : {
              background: 'linear-gradient(135deg, #8b5cf6, #f59e0b)', color: '#fff',
            }}>
            {isLiveMode ? <PhoneOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          {/* Send */}
          <button type="submit" disabled={isLoading || !inputText.trim()}
            className="flex-none w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #f59e0b)', color: '#fff' }}>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ===== LIVE VIDEO CONFERENCE MODAL ===== */}
      {isLiveMode && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#000' }}>
          {/* Header */}
          <div className="flex-none pt-safe flex items-center justify-between px-3 py-2" style={{
            backgroundColor: 'rgba(0,0,0,0.9)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold" style={{ color: '#fca5a5' }}>AO VIVO</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>• {teacher.name}</span>
            </div>
            <button onClick={exitLiveMode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-600 text-white">
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Encerrar</span>
            </button>
          </div>

          {/* Professor (top — large) — D-ID video or static fallback */}
          <div className="flex-1 relative overflow-hidden">
            {professorVideoUrl ? (
              <video
                ref={professorVideoRef}
                src={professorVideoUrl}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => setIsSpeaking(true)}
                onEnded={() => { setIsSpeaking(false); setProfessorVideoUrl(null); }}
                onError={() => setProfessorVideoUrl(null)}
              />
            ) : (
              <img src={teacher.avatar} alt={teacher.name}
                className="w-full h-full object-cover"
                style={{ filter: isSpeaking ? 'brightness(1)' : 'brightness(0.6)' }}
              />
            )}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 40%)',
            }} />

            {isSpeaking && (
              <div className="absolute bottom-4 left-4 flex items-center space-x-2 px-3 py-1.5 rounded-full backdrop-blur-md" style={{
                backgroundColor: 'rgba(245,158,11,0.2)',
                border: '1px solid rgba(245,158,11,0.4)',
              }}>
                <span className="flex space-x-[2px]">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="w-[3px] rounded-full inline-block" style={{
                      backgroundColor: 'var(--js-accent-amber)',
                      height: `${6 + Math.random() * 10}px`,
                      animation: `pulse ${0.3 + i * 0.1}s ease-in-out infinite alternate`,
                    }} />
                  ))}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--js-accent-amber)' }}>
                  {teacher.name} falando...
                </span>
              </div>
            )}

            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg backdrop-blur-md text-xs font-bold" style={{
              backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff',
            }}>{teacher.name}</div>
          </div>

          {/* Student (bottom — small) */}
          <div className="flex-none relative" style={{
            height: '25vh', minHeight: '140px', maxHeight: '220px',
            backgroundColor: '#111',
            borderTop: '2px solid var(--js-accent-purple)',
          }}>
            <video ref={userVideoRef} autoPlay playsInline muted
              className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />

            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-bold" style={{
              backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff',
            }}>{studentName}</div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center space-x-4 py-3 pb-safe" style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.8), transparent)',
            }}>
              <button onClick={() => setIsMuted(!isMuted)}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isMuted ? '#dc2626' : 'rgba(255,255,255,0.15)', color: '#fff' }}>
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button onClick={exitLiveMode}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 text-white shadow-lg">
                <PhoneOff className="w-5 h-5" />
              </button>

              <button onClick={() => setIsCameraOn(!isCameraOn)}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: !isCameraOn ? '#dc2626' : 'rgba(255,255,255,0.15)', color: '#fff' }}>
                {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
