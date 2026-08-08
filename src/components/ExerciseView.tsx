import React, { useState } from 'react';
import { Shield, CheckCircle2, RefreshCw, Send, Sparkles, BookOpen } from 'lucide-react';
import { DbExercise } from '../db/schema';

export const ExerciseView: React.FC = () => {
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    feedbackPt: string;
    sampleCorrectAnswerEn: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleExercise: DbExercise = {
    id: 'ex-1',
    title: 'Drill Instruction Correction',
    bjjTopic: 'Guard Passing & Time Duration',
    difficultyLevel: 'Intermediate',
    promptEn: 'Reescreva e corrija a seguinte frase dita por um aluno: "I train BJJ since 2 years and I like very much guard pass."',
    contextPt: 'Aplique as regras de "Present Perfect Continuous" para tempo contínuo e a ordem natural de "enjoy passing the guard".',
    sampleCorrectAnswerEn: 'I have been training BJJ for two years, and I really enjoy passing the guard.',
    category: 'TRANSLATION',
    createdAt: new Date().toISOString(),
  };

  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: sampleExercise.id,
          studentAnswer,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setEvaluationResult(json.data);
      }
    } catch (err) {
      console.error('Error submitting exercise:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Exercício Prático de Inglês Técnico no BJJ</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Treine sua escrita e raciocínio imediato para não hesitar no dojo no exterior.
          </p>
        </div>
        <span className="bg-slate-800 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">
          Nível: {sampleExercise.difficultyLevel}
        </span>
      </div>

      {/* Exercise Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Desafio de Correção de Frase</span>
          <h3 className="text-base font-bold text-white mt-1">{sampleExercise.promptEn}</h3>
          <p className="text-xs text-slate-400 mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <strong>Dica Pedagógica:</strong> {sampleExercise.contextPt}
          </p>
        </div>

        {/* Answer Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Sua Resposta em Inglês:</label>
          <textarea
            rows={3}
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Digite a frase corrigida aqui (ex: I have been training BJJ for two years...)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        <button
          onClick={handleSubmitAnswer}
          disabled={isLoading || !studentAnswer.trim()}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Avaliando Resposta...</span>
            </>
          ) : (
            <>
              <span>Enviar Exercício para Avaliação AI</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Evaluation Result */}
        {evaluationResult && (
          <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Resultado da Avaliação Pedagógica</span>
              </span>
              <span className="text-sm font-black text-amber-300">Nota: {evaluationResult.score}/100</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{evaluationResult.feedbackPt}</p>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Gabarito Ideal Sugerido: </span>
              <span className="font-bold text-emerald-300 block mt-1">"{evaluationResult.sampleCorrectAnswerEn}"</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
