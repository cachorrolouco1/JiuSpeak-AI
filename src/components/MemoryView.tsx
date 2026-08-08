import React, { useEffect, useState } from 'react';
import { Database, AlertTriangle, CheckCircle, BookMarked, History, RefreshCw, Sparkles } from 'lucide-react';
import { StudentMemoryContext } from '../core/types/memory.types';

interface MemoryViewProps {
  studentId: string;
}

export const MemoryView: React.FC<MemoryViewProps> = ({ studentId }) => {
  const [memoryContext, setMemoryContext] = useState<StudentMemoryContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMemory();
  }, [studentId]);

  const fetchMemory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ai/student/${studentId}/memory`);
      const json = await res.json();
      if (json.success && json.data) {
        setMemoryContext(json.data);
      }
    } catch (err) {
      console.error('Error fetching memory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !memoryContext) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center text-slate-400 text-sm space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span>Inspecionando Memória em Camadas do Aluno...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Memória em Camadas do Aluno (Layered Context Engine)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Garante que a JiuSpeak AI lembre de erros recorrentes, retenha histórico episódico de treinos e aplique repetição espaçada no vocabulário de BJJ.
          </p>
        </div>
        <button
          onClick={fetchMemory}
          className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Memória</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layer 1: Active Learning Errors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Erros Recorrentes Mapeados (Memória de Desempenho)</h3>
            </div>
            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold">
              {memoryContext.activeErrors.length} Ativo(s)
            </span>
          </div>

          <div className="space-y-3">
            {memoryContext.activeErrors.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">Nenhum erro recorrente no momento. Ótima precisão gramatical!</p>
            ) : (
              memoryContext.activeErrors.map((err) => (
                <div key={err.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{err.errorPattern}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                      Ocorrências: {err.occurrenceCount}x
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-slate-500">Frase incorreta: </span>
                      <span className="text-red-300 line-through">"{err.incorrectSentence}"</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Correção BJJ: </span>
                      <span className="text-emerald-300 font-bold">"{err.correctedSentence}"</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Layer 2: Spaced Repetition Vocabulary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-400">
              <BookMarked className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Vocabulário de BJJ para Revisão Espaçada</h3>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">
              Prioridade Spaced Repetition
            </span>
          </div>

          <div className="space-y-3">
            {memoryContext.priorityVocabToReview.map((vocab) => (
              <div key={vocab.vocabId} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{vocab.termEn}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Nível de Domínio: <span className="text-amber-400 font-bold">{vocab.masteryLevel}/5</span>
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <span
                      key={lvl}
                      className={`w-2.5 h-2.5 rounded-full ${
                        lvl <= vocab.masteryLevel ? 'bg-amber-400 shadow shadow-amber-400/50' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layer 3: Episodic Memories & Short-Term Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-amber-400">
          <History className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Histórico Episódico & Contexto de Treinos Passados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memoryContext.recentEpisodicMemories.map((mem) => (
            <div key={mem.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300">Cenário: {mem.bjjScenario}</span>
                <span className="text-[10px] text-slate-500">{new Date(mem.date).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-200 font-medium">{mem.summary}</p>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-300">Aprenziado-chave:</strong> {mem.keyTakeaway}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
