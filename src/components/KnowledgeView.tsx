import React, { useEffect, useState } from 'react';
import { BookOpen, Search, ShieldCheck, Sparkles, FileText, Bookmark } from 'lucide-react';
import { KnowledgeQueryResult, JiuSpeakCourseModule } from '../core/types/knowledge.types';

export const KnowledgeView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('knee cut');
  const [searchResults, setSearchResults] = useState<KnowledgeQueryResult[]>([]);
  const [officialModules, setOfficialModules] = useState<JiuSpeakCourseModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ai/knowledge/search?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSearchResults(json.data);
      }
    } catch (err) {
      console.error('Error searching knowledge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Conteúdo Oficial JiuSpeak AI & Base RAG</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pesquise o currículo oficial e a terminologia de arbitragem IBJJF/ADCC e expressões técnicas de dojo.
          </p>
        </div>
        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>OFFICIAL_JIUSPEAK_CONTENT</span>
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar termo de Jiu-Jitsu (ex: knee cut, advantage, underhook, stalling)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
          >
            {isLoading ? 'Buscando RAG...' : 'Pesquisar'}
          </button>
        </form>
      </div>

      {/* RAG Search Results Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resultados da Consulta RAG ({searchResults.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map((item, index) => {
            const isOfficial = item.sourceType === 'OFFICIAL_JIUSPEAK_CONTENT';
            return (
              <div
                key={index}
                className={`p-5 rounded-2xl border transition-all ${
                  isOfficial
                    ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isOfficial
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.sourceType}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Relevância: {(item.relevanceScore * 100).toFixed(0)}%</span>
                </div>

                <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{item.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
