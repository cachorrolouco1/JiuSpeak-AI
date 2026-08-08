import React from 'react';
import { Award, Zap, BookOpen, Database, Shield, Mic, ChevronDown } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenApiDocs: () => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenApiDocs, isAdmin }) => {
  // Tabs que todo mundo vê
  const studentTabs = [
    { id: 'chat', label: 'AI Chat', icon: Zap },
    { id: 'profile', label: 'Perfil', icon: Award },
    { id: 'exercise', label: 'Exercícios', icon: Shield },
  ];

  // Tabs só para admin
  const adminTabs = [
    { id: 'memory', label: 'Memória', icon: Database },
    { id: 'knowledge', label: 'RAG & Curriculum', icon: BookOpen },
    { id: 'voice-config', label: 'Config. Vozes', icon: Mic },
  ];

  const visibleTabs = isAdmin ? [...studentTabs, ...adminTabs] : studentTabs;
  // Mobile: aluno vê 3 tabs, admin vê 6
  const mobileGridCols = isAdmin ? 'grid-cols-6' : 'grid-cols-3';

  return (
    <>
      {/* Top Header Bar — estilo JiuSpeak principal */}
      <header className="sticky top-0 z-40 pt-safe" style={{
        backgroundColor: 'var(--js-bg-secondary)',
        borderBottom: '1px solid var(--js-border)',
      }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">

          {/* Brand — JiuSpeak AI */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            {/* Logo com gradiente roxo/amber igual ao JiuSpeak */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9, #f59e0b)',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              }}
            >
              <span className="text-lg font-black">JS</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: 'var(--js-text-primary)' }}>
                  JIUSPEAK{' '}
                  <span className="font-extrabold" style={{ color: 'var(--js-accent-amber)' }}>AI</span>
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: 'var(--js-accent-purple-light)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}>
                  v1.0
                </span>
              </div>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--js-text-muted)' }}>
                Professor Virtual de Inglês para BJJ
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1 rounded-xl" style={{
            backgroundColor: 'var(--js-bg-primary)',
            border: '1px solid var(--js-border)',
          }}>
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isAdminTab = adminTabs.some(a => a.id === tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #8b5cf6, #f59e0b)',
                    color: '#ffffff',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                  } : {
                    color: isAdminTab ? 'var(--js-accent-purple-light)' : 'var(--js-text-secondary)',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Status indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs" style={{
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
            }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--js-accent-purple)' }}></span>
              <span className="font-medium" style={{ color: 'var(--js-accent-purple-light)' }}>Carlos</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                backgroundColor: 'var(--js-accent-purple)',
                color: '#ffffff',
              }}>Azul</span>
            </div>

            {isAdmin && (
              <span className="hidden sm:flex items-center space-x-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--js-accent-amber)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}>
                <Shield className="w-3 h-3" />
                <span>ADMIN</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar — matching JiuSpeak principal */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md" style={{
        backgroundColor: 'rgba(26, 19, 51, 0.97)',
        borderTop: '1px solid var(--js-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        <div className={`grid ${mobileGridCols} gap-0 text-center`} style={{ height: '56px' }}>
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAdminTab = adminTabs.some(a => a.id === tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center h-full relative transition-colors active:opacity-70"
                style={{
                  color: isActive
                    ? 'var(--js-accent-amber)'
                    : isAdminTab
                      ? 'var(--js-accent-purple-light)'
                      : 'var(--js-text-muted)',
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {/* Active indicator dot — matching JiuSpeak */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{
                    backgroundColor: 'var(--js-accent-amber)',
                  }} />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 leading-tight">
                  {tab.id === 'voice-config' ? 'Vozes' : tab.id === 'knowledge' ? 'RAG' : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
