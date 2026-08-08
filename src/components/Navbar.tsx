import React from 'react';
import { Award, Zap, BookOpen, Database, Shield, Terminal, Mic } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenApiDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenApiDocs }) => {
  return (
    <>
      {/* Top Header Bar */}
      <header id="jiuspeak-navbar" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-red-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/20">
              <span className="text-xl font-black">JS</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">JIUSPEAK <span className="text-amber-400 font-extrabold">AI</span></h1>
                <span className="bg-slate-800 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  v1.0 REAL
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Inteligência Artificial Educacional para BJJ</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'chat' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>

            <button
              id="nav-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'profile' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Perfil</span>
            </button>

            <button
              id="nav-tab-memory"
              onClick={() => setActiveTab('memory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'memory' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Memória</span>
            </button>

            <button
              id="nav-tab-knowledge"
              onClick={() => setActiveTab('knowledge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'knowledge' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>RAG & Curriculum</span>
            </button>

            <button
              id="nav-tab-exercise"
              onClick={() => setActiveTab('exercise')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'exercise' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Exercícios</span>
            </button>

            <button
              id="nav-tab-voice-config"
              onClick={() => setActiveTab('voice-config')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'voice-config' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Config. Vozes</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-blue-950/80 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-blue-200 font-medium">Carlos</span>
              <span className="bg-blue-600 text-white px-1.5 py-0.2 rounded text-[10px] font-bold">Azul</span>
            </div>

            <button
              id="btn-open-swagger"
              onClick={onOpenApiDocs}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[44px] sm:min-h-0"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API Docs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar (Mobile First - Touch Target >= 44px) */}
      <nav id="jiuspeak-mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-1 py-1 pb-safe">
        <div className="grid grid-cols-6 gap-0.5 text-center">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-all ${
              activeTab === 'chat' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-all ${
              activeTab === 'profile' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-all ${
              activeTab === 'memory' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">Memória</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-all ${
              activeTab === 'knowledge' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">RAG</span>
          </button>

          <button
            onClick={() => setActiveTab('exercise')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-all ${
              activeTab === 'exercise' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">Exercício</span>
          </button>

          <button
            onClick={() => setActiveTab('voice-config')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-all ${
              activeTab === 'voice-config' ? 'text-amber-400 font-bold bg-slate-800/80' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4 mb-0.5 text-amber-400" />
            <span className="text-[9px]">Vozes</span>
          </button>
        </div>
      </nav>
    </>
  );
};
