import React, { useState, useEffect } from 'react';
import { Mic, CheckCircle2, AlertTriangle, Save, Volume2, ShieldCheck, RefreshCw, Key, Info } from 'lucide-react';

interface TeacherAdminData {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  titlePt: string;
  voiceProvider: string;
  voiceId: string;
  voiceConfigured: boolean;
  updatedAt: string;
}

export const TeacherVoiceConfigView: React.FC = () => {
  const [marcosVoiceId, setMarcosVoiceId] = useState<string>('');
  const [carolVoiceId, setCarolVoiceId] = useState<string>('');
  const [teachersData, setTeachersData] = useState<TeacherAdminData[]>([]);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingMarcos, setIsSavingMarcos] = useState<boolean>(false);
  const [isSavingCarol, setIsSavingCarol] = useState<boolean>(false);
  const [isSavingBatch, setIsSavingBatch] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [testingAudioUrl, setTestingAudioUrl] = useState<string | null>(null);
  const [isTestingVoiceId, setIsTestingVoiceId] = useState<string | null>(null);

  const fetchAdminConfig = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/ai/admin/teachers');
      const json = await res.json();
      if (json.success) {
        setTeachersData(json.data);
        setApiKeyConfigured(json.elevenLabsApiKeyConfigured);
        const marcos = json.data.find((t: TeacherAdminData) => t.id === 'marcos');
        const carol = json.data.find((t: TeacherAdminData) => t.id === 'carol');
        if (marcos) setMarcosVoiceId(marcos.voiceId || '');
        if (carol) setCarolVoiceId(carol.voiceId || '');
      } else {
        setFeedback({ type: 'error', message: json.error || 'Erro ao carregar configurações dos professores.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Erro de rede ao conectar com o servidor backend.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAdminConfig(); }, []);

  const saveSingleTeacherVoice = async (teacherId: 'marcos' | 'carol', voiceIdValue: string) => {
    if (teacherId === 'marcos') setIsSavingMarcos(true);
    if (teacherId === 'carol') setIsSavingCarol(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/ai/admin/teachers/${teacherId}/voice-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId: voiceIdValue }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: 'success',
          message: json.message || `Voice ID do(a) ${teacherId === 'marcos' ? 'Professor Marcos' : 'Professora Carol'} atualizada com sucesso!`,
        });
        await fetchAdminConfig();
      } else {
        setFeedback({ type: 'error', message: json.error || 'Falha ao salvar a Voice ID.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Erro de conexão ao salvar a Voice ID.' });
    } finally {
      setIsSavingMarcos(false);
      setIsSavingCarol(false);
    }
  };

  const saveBatchVoiceConfig = async () => {
    setIsSavingBatch(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/ai/admin/teachers/voice-config/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marcosVoiceId, carolVoiceId }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: '✓ Ambas as Voice IDs foram validadas e salvas com sucesso!' });
        await fetchAdminConfig();
      } else {
        setFeedback({ type: 'error', message: json.error || 'Erro na validação em lote das Voice IDs.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro de rede ao salvar as configurações em lote.' });
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleTestVoice = async (teacherId: 'marcos' | 'carol') => {
    setIsTestingVoiceId(teacherId);
    setTestingAudioUrl(null);
    setFeedback(null);
    const teacherName = teacherId === 'marcos' ? 'Professor Marcos' : 'Professora Carol';
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'std-carlos-123',
          teacherId,
          message: 'Teste de áudio oficial',
          mode: 'voice',
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.audioUrl) {
        setTestingAudioUrl(json.data.audioUrl);
        const audio = new Audio(json.data.audioUrl);
        audio.play();
        setFeedback({ type: 'success', message: `Áudio de teste gerado com sucesso para ${teacherName}!` });
      } else if (json.data?.voiceNotice) {
        setFeedback({ type: 'error', message: json.data.voiceNotice });
      } else {
        setFeedback({ type: 'error', message: `Não foi possível sintetizar áudio para ${teacherName}.` });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao solicitar teste de síntese de voz.' });
    } finally {
      setIsTestingVoiceId(null);
    }
  };

  const marcosConfigured = teachersData.find((t) => t.id === 'marcos')?.voiceConfigured || false;
  const carolConfigured = teachersData.find((t) => t.id === 'carol')?.voiceConfigured || false;

  const renderTeacherCard = (
    teacherId: 'marcos' | 'carol',
    name: string,
    subtitle: string,
    avatarUrl: string,
    voiceId: string,
    setVoiceId: (v: string) => void,
    isConfigured: boolean,
    isSaving: boolean,
    accentColor: string,
    accentBg: string,
  ) => (
    <div className="rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all" style={{
      backgroundColor: 'var(--js-bg-card)',
      border: `1px solid var(--js-border)`,
    }}>
      <div className="space-y-4">
        <div className="flex items-start justify-between pb-4" style={{ borderBottom: '1px solid var(--js-border)' }}>
          <div className="flex items-center space-x-3">
            <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover shadow"
              style={{ border: `2px solid ${accentColor}` }} />
            <div>
              <h3 className="text-base font-extrabold" style={{ color: 'var(--js-text-primary)' }}>{name.toUpperCase()}</h3>
              <p className="text-xs font-semibold" style={{ color: accentColor }}>{subtitle}</p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{
            backgroundColor: isConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            color: isConfigured ? '#6ee7b7' : 'var(--js-accent-amber)',
            border: `1px solid ${isConfigured ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
          }}>
            {isConfigured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{isConfigured ? '✓ Voice ID configurada' : '⚠️ Pendente'}</span>
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold" style={{ color: 'var(--js-text-secondary)' }}>Voice ID do ElevenLabs:</label>
          <input
            type="text"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="Cole aqui a Voice ID do ElevenLabs..."
            className="w-full rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none min-h-[44px]"
            style={{
              backgroundColor: 'var(--js-bg-input)',
              border: '1px solid var(--js-border)',
              color: 'var(--js-text-primary)',
            }}
          />
          <p className="text-[10px]" style={{ color: 'var(--js-text-muted)' }}>Armazenada com segurança no banco server-side.</p>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid var(--js-border)' }}>
        <button
          onClick={() => saveSingleTeacherVoice(teacherId, voiceId)}
          disabled={isSaving}
          className="w-full sm:w-auto flex-1 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow flex items-center justify-center space-x-2 min-h-[44px]"
          style={{ backgroundColor: accentColor, color: '#ffffff' }}
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Salvar Voice ID</span>
        </button>
        {isConfigured && (
          <button
            onClick={() => handleTestVoice(teacherId)}
            disabled={isTestingVoiceId === teacherId}
            className="w-full sm:w-auto font-semibold px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 min-h-[44px]"
            style={{
              backgroundColor: 'var(--js-bg-primary)',
              color: accentColor,
              border: `1px solid ${accentBg}`,
            }}
          >
            <Volume2 className={`w-4 h-4 ${isTestingVoiceId === teacherId ? 'animate-pulse' : ''}`} />
            <span>Testar Voz</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 shadow-2xl relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, var(--js-bg-secondary), var(--js-bg-card), rgba(139, 92, 246, 0.15))',
        border: '1px solid var(--js-border)',
      }}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Mic className="w-48 h-48" style={{ color: 'var(--js-accent-purple)' }} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--js-accent-amber)' }}>
              <ShieldCheck className="w-4 h-4" />
              <span>Painel Administrativo — JiuSpeak AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--js-text-primary)' }}>
              Configuração de Voz dos Professores
            </h1>
            <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--js-text-secondary)' }}>
              Cadastre as Voice IDs do ElevenLabs para o <strong style={{ color: 'var(--js-accent-amber)' }}>Professor Marcos</strong> (masculina) e a <strong style={{ color: 'var(--js-accent-purple-light)' }}>Professora Carol</strong> (feminina).
            </p>
          </div>
          <button
            onClick={fetchAdminConfig}
            disabled={isLoading}
            className="self-start md:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow min-h-[44px]"
            style={{
              backgroundColor: 'var(--js-bg-primary)',
              color: 'var(--js-text-secondary)',
              border: '1px solid var(--js-border)',
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar Status</span>
          </button>
        </div>

        <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs" style={{ borderTop: '1px solid var(--js-border)' }}>
          <div className="flex items-center space-x-2">
            <span style={{ color: 'var(--js-text-muted)' }}>Provedor TTS:</span>
            <span className="font-bold flex items-center space-x-1.5 px-2.5 py-1 rounded-md" style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--js-accent-purple-light)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}>
              <Mic className="w-3.5 h-3.5" />
              <span>ElevenLabs Multilingual v2</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span style={{ color: 'var(--js-text-muted)' }}>API Key:</span>
            <span className="font-bold flex items-center space-x-1.5 px-2.5 py-1 rounded-md" style={{
              backgroundColor: apiKeyConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: apiKeyConfigured ? '#6ee7b7' : 'var(--js-accent-amber)',
              border: `1px solid ${apiKeyConfigured ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            }}>
              {apiKeyConfigured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{apiKeyConfigured ? '✓ Configurada' : '⚠️ Ausente no .env'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="p-4 rounded-xl flex items-start space-x-3 text-xs font-medium shadow-lg" style={{
          backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : feedback.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : feedback.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
          color: feedback.type === 'success' ? '#6ee7b7' : feedback.type === 'error' ? '#fca5a5' : '#93c5fd',
        }}>
          {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
          {feedback.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
          {feedback.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5" />}
          <div className="flex-1 leading-relaxed">{feedback.message}</div>
        </div>
      )}

      {/* Teacher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderTeacherCard(
          'marcos', 'Professor Marcos', 'Voz masculina — ElevenLabs',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          marcosVoiceId, setMarcosVoiceId, marcosConfigured, isSavingMarcos,
          '#f59e0b', 'rgba(245, 158, 11, 0.25)',
        )}
        {renderTeacherCard(
          'carol', 'Professora Carol', 'Voz feminina — ElevenLabs',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          carolVoiceId, setCarolVoiceId, carolConfigured, isSavingCarol,
          '#8b5cf6', 'rgba(139, 92, 246, 0.25)',
        )}
      </div>

      {/* Batch Save */}
      <div className="rounded-2xl p-6 shadow-xl space-y-4" style={{
        backgroundColor: 'var(--js-bg-card)',
        border: '1px solid var(--js-border)',
      }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold flex items-center space-x-2" style={{ color: 'var(--js-text-primary)' }}>
              <Key className="w-4 h-4" style={{ color: 'var(--js-accent-amber)' }} />
              <span>Salvar Ambas as Configurações de Voz</span>
            </h4>
            <p className="text-xs" style={{ color: 'var(--js-text-muted)' }}>
              Valida que as duas Voice IDs são exclusivas e salva ambas simultaneamente.
            </p>
          </div>
          <button
            onClick={saveBatchVoiceConfig}
            disabled={isSavingBatch}
            className="font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 min-h-[48px]"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #f59e0b)',
              color: '#ffffff',
            }}
          >
            {isSavingBatch ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Salvar Ambas as Voice IDs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
