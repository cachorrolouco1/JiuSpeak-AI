import React, { useEffect, useState } from 'react';
import { Award, BookOpen, CheckCircle, AlertCircle, TrendingUp, Mic, RefreshCw, BarChart2 } from 'lucide-react';
import { StudentProgress, DimensionScores } from '../core/types/student.types';

interface StudentProfileViewProps {
  studentId: string;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ studentId }) => {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [studentId]);

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ai/student/${studentId}/progress`);
      const json = await res.json();
      if (json.success && json.data) {
        setProgress(json.data);
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !progress) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center text-slate-400 text-sm space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span>Carregando relatório das 6 dimensões do aluno...</span>
      </div>
    );
  }

  const { scores } = progress;

  const dimensionList = [
    { key: 'grammar', label: 'Gramática BJJ', score: scores.grammar, color: 'from-blue-500 to-indigo-600', description: 'Estruturação verbal e tempos gramaticais' },
    { key: 'vocabulary', label: 'Vocabulário Técnico', score: scores.vocabulary, color: 'from-amber-500 to-amber-600', description: 'Termos de posições, raspagens e regras' },
    { key: 'fluency', label: 'Fluência & Ritmo', score: scores.fluency, color: 'from-emerald-500 to-teal-600', description: 'Velocidade e naturalidade nas respostas' },
    { key: 'comprehension', label: 'Compreensão Auditiva', score: scores.comprehension, color: 'from-purple-500 to-indigo-600', description: 'Entendimento de instruções e perguntas' },
    { key: 'context', label: 'Adequação de Contexto BJJ', score: scores.context, color: 'from-red-500 to-rose-600', description: 'Uso apropriado da linguagem de dojo/campeonato' },
    { key: 'pronunciation', label: 'Pronúncia Acústica', score: scores.pronunciation, color: 'from-cyan-500 to-blue-600', description: 'Nota calculada estritamente quando há gravação de voz' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Student Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-800 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-600/30 border-2 border-blue-400">
            <span>AZ</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Carlos "Grip" Silva</h2>
              <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow">
                Faixa Azul - 2 Graus
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Alliance BJJ International • Nível de Inglês: <span className="text-amber-300 font-semibold">{progress.currentLevel}</span></p>
            <p className="text-xs text-slate-400 mt-0.5">Objetivo: Ministrar seminários e competir na Califórnia (IBJJF)</p>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center min-w-[180px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Média Geral BJJ AI</span>
          <div className="text-4xl font-black text-amber-400 my-1">{progress.overallScore}<span className="text-lg text-slate-500">/100</span></div>
          <p className="text-[10px] text-slate-400">Ponderado pelas dimensões ativas</p>
        </div>
      </div>

      {/* 6 Dimensions Breakdown Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Avaliação Multidimensional (6 Dimensões)</h3>
          </div>
          <span className="text-xs text-slate-400">Atualizado dinamicamente pelo AI Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensionList.map((dim) => {
            const isNullPronunciation = dim.key === 'pronunciation' && dim.score === null;
            return (
              <div key={dim.key} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{dim.label}</span>
                    {isNullPronunciation ? (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center space-x-1">
                        <Mic className="w-3 h-3 text-amber-400" />
                        <span>Áudio necessário</span>
                      </span>
                    ) : (
                      <span className="text-sm font-black text-amber-400">{dim.score}/100</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{dim.description}</p>
                </div>

                {/* Progress Bar */}
                {!isNullPronunciation ? (
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full bg-gradient-to-r ${dim.color} transition-all duration-500`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">
                    Grave um áudio no chat para que a IA analise acústica e fonética real.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths, Weaknesses & Recommended Drills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Pontos Fortes Conquistados</h4>
          </div>
          <ul className="space-y-2">
            {progress.strengths.map((str, i) => (
              <li key={i} className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Pontos de Atenção</h4>
          </div>
          <ul className="space-y-2">
            {progress.weaknesses.map((wk, i) => (
              <li key={i} className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Drills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <TrendingUp className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Drills Recomendados</h4>
          </div>
          <ul className="space-y-2">
            {progress.recommendedRevisions.map((rec, i) => (
              <li key={i} className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
