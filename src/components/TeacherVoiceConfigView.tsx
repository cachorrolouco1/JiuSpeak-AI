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

  useEffect(() => {
    fetchAdminConfig();
  }, []);

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
        setFeedback({
          type: 'error',
          message: json.error || 'Falha ao salvar a Voice ID.',
        });
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
        body: JSON.stringify({
          marcosVoiceId,
          carolVoiceId,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setFeedback({
          type: 'success',
          message: '✓ Ambas as Voice IDs foram validadas e salvas com sucesso no banco de dados!',
        });
        await fetchAdminConfig();
      } else {
        setFeedback({
          type: 'error',
          message: json.error || 'Erro na validação em lote das Voice IDs.',
        });
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
    const sampleText = teacherId === 'marcos'
      ? 'Oss! Eu sou o Professor Marcos. Vamos treinar o seu inglês de Jiu-Jitsu para o tatame internacional.'
      : 'Oss! Eu sou a Professora Carol. Vamos praticar a sua fluência em inglês para simulações de campeonato.';

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
        setFeedback({
          type: 'success',
          message: `Áudio de teste gerado com sucesso para ${teacherName}!`,
        });
      } else if (json.data?.voiceNotice) {
        setFeedback({
          type: 'error',
          message: json.data.voiceNotice,
        });
      } else {
        setFeedback({
          type: 'error',
          message: `Não foi possível sintetizar áudio para ${teacherName}. Verifique a Voice ID e a API Key.`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao solicitar teste de síntese de voz.' });
    } finally {
      setIsTestingVoiceId(null);
    }
  };

  const marcosConfigured = teachersData.find((t) => t.id === 'marcos')?.voiceConfigured || false;
  const carolConfigured = teachersData.find((t) => t.id === 'carol')?.voiceConfigured || false;

  return (
    <div id="teacher-voice-config-view" className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Mic className="w-48 h-48 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Painel Administrativo da JiuSpeak AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Configuração de Voz dos Professores
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Cadastre as Voice IDs exclusivas do ElevenLabs para o <strong className="text-amber-300">Professor Marcos</strong> (Voz Masculina) e para a <strong className="text-indigo-300">Professora Carol</strong> (Voz Feminina).
            </p>
          </div>

          <button
            id="btn-refresh-voice-config"
            onClick={fetchAdminConfig}
            disabled={isLoading}
            className="self-start md:self-auto flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar Status</span>
          </button>
        </div>

        {/* Server Status Indicators */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Provedor TTS:</span>
            <span className="bg-amber-500/10 text-amber-300 font-bold px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center space-x-1.5">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>ElevenLabs Multilingual v2</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">ElevenLabs API Key no Backend:</span>
            {apiKeyConfigured ? (
              <span className="bg-emerald-500/10 text-emerald-300 font-bold px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>✓ ELEVENLABS_API_KEY Configurada</span>
              </span>
            ) : (
              <span className="bg-amber-500/10 text-amber-300 font-bold px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>⚠️ API Key Ausente no .env</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start space-x-3 text-xs font-medium shadow-lg animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-blue-950/90 border-blue-500/50 text-blue-200'
          }`}
        >
          {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {feedback.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
          {feedback.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
          <div className="flex-1 leading-relaxed">{feedback.message}</div>
        </div>
      )}

      {/* Main Two Column Teachers Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROFESSOR MARCOS CARD */}
        <div id="config-card-marcos" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 hover:border-amber-500/40 transition-all">
          <div className="space-y-4">
            {/* Header & Status Badge */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt="Professor Marcos"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/60 shadow"
                />
                <div>
                  <h3 className="text-base font-extrabold text-white">PROFESSOR MARCOS</h3>
                  <p className="text-xs text-amber-400 font-semibold">Voz masculina — ElevenLabs</p>
                </div>
              </div>

              {marcosConfigured ? (
                <span className="inline-flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>✓ Voice ID configurada</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚠️ Voice ID não configurada</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Head Instructor de Jiu-Jitsu. Requer uma Voice ID masculina da ElevenLabs para dublagem com dicção metódica e firme.
            </p>

            {/* Input Field */}
            <div className="space-y-1.5">
              <label htmlFor="input-voice-id-marcos" className="block text-xs font-bold text-slate-200">
                Voice ID do ElevenLabs:
              </label>
              <div className="relative">
                <input
                  id="input-voice-id-marcos"
                  type="text"
                  value={marcosVoiceId}
                  onChange={(e) => setMarcosVoiceId(e.target.value)}
                  placeholder="Cole aqui a Voice ID masculina do ElevenLabs (ex: JBFqnCBsd...)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-400 min-h-[44px]"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Nunca exposta ao frontend. Armazenada com segurança no banco de dados SQLite server-side.
              </p>
            </div>
          </div>

          {/* Action Buttons for Marcos */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              id="btn-save-marcos-voice"
              onClick={() => saveSingleTeacherVoice('marcos', marcosVoiceId)}
              disabled={isSavingMarcos}
              className="w-full sm:w-auto flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer"
            >
              {isSavingMarcos ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Salvar Voice ID do Marcos</span>
            </button>

            {marcosConfigured && (
              <button
                id="btn-test-marcos-voice"
                onClick={() => handleTestVoice('marcos')}
                disabled={isTestingVoiceId === 'marcos'}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 min-h-[44px]"
              >
                <Volume2 className={`w-4 h-4 ${isTestingVoiceId === 'marcos' ? 'animate-pulse' : ''}`} />
                <span>Testar Voz</span>
              </button>
            )}
          </div>
        </div>

        {/* PROFESSORA CAROL CARD */}
        <div id="config-card-carol" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 hover:border-indigo-500/40 transition-all">
          <div className="space-y-4">
            {/* Header & Status Badge */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                  alt="Professora Carol"
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/60 shadow"
                />
                <div>
                  <h3 className="text-base font-extrabold text-white">PROFESSORA CAROL</h3>
                  <p className="text-xs text-indigo-400 font-semibold">Voz feminina — ElevenLabs</p>
                </div>
              </div>

              {carolConfigured ? (
                <span className="inline-flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>✓ Voice ID configurada</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚠️ Voice ID não configurada</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Professora de BJJ & Inglês Instrumental. Requer uma Voice ID feminina da ElevenLabs para tom dinâmico e motivador.
            </p>

            {/* Input Field */}
            <div className="space-y-1.5">
              <label htmlFor="input-voice-id-carol" className="block text-xs font-bold text-slate-200">
                Voice ID do ElevenLabs:
              </label>
              <div className="relative">
                <input
                  id="input-voice-id-carol"
                  type="text"
                  value={carolVoiceId}
                  onChange={(e) => setCarolVoiceId(e.target.value)}
                  placeholder="Cole aqui a Voice ID feminina do ElevenLabs (ex: EXAVITQu...)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 min-h-[44px]"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Nunca exposta ao frontend. Armazenada com segurança no banco de dados SQLite server-side.
              </p>
            </div>
          </div>

          {/* Action Buttons for Carol */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              id="btn-save-carol-voice"
              onClick={() => saveSingleTeacherVoice('carol', carolVoiceId)}
              disabled={isSavingCarol}
              className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer"
            >
              {isSavingCarol ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Salvar Voice ID da Carol</span>
            </button>

            {carolConfigured && (
              <button
                id="btn-test-carol-voice"
                onClick={() => handleTestVoice('carol')}
                disabled={isTestingVoiceId === 'carol'}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-semibold px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 min-h-[44px]"
              >
                <Volume2 className={`w-4 h-4 ${isTestingVoiceId === 'carol' ? 'animate-pulse' : ''}`} />
                <span>Testar Voz</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Batch Save Action & Security Notes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Salvar Ambas as Configurações de Voz</span>
            </h4>
            <p className="text-xs text-slate-400">
              Valida que as duas Voice IDs são exclusivas e salva ambas simultaneamente na tabela <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">teachers</code> do banco SQLite.
            </p>
          </div>

          <button
            id="btn-save-all-voices"
            onClick={saveBatchVoiceConfig}
            disabled={isSavingBatch}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 min-h-[48px] cursor-pointer"
          >
            {isSavingBatch ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Salvar Ambas as Voice IDs</span>
          </button>
        </div>

        {/* Security & Validation Instructions */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2 text-slate-300">
          <p className="font-bold text-amber-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Regras de Validação & Arquitetura Segura:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong>Isolamento Server-Side:</strong> A <code className="text-slate-200">ELEVENLABS_API_KEY</code> e as Voice IDs completas são gerenciadas exclusivamente no servidor.</li>
            <li><strong>Independência Obrigatória:</strong> Cada professor deve possuir sua própria Voice ID diferente. O sistema rejeita o cadastro da mesma Voice ID para ambos os professores.</li>
            <li><strong>Fluxo de Voz Dinâmico:</strong> Ao selecionar o Professor Marcos (<code className="text-slate-200">teacherId = marcos</code>) ou a Professora Carol (<code className="text-slate-200">teacherId = carol</code>), a síntese de voz utiliza estritamente a Voice ID cadastrada para aquele professor.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
