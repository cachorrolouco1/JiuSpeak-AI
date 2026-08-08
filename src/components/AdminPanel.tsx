import React, { useState } from 'react';
import { Database, BookOpen, Mic, FileText, ChevronRight } from 'lucide-react';

// Import existing admin views
import { MemoryView } from './MemoryView';
import { KnowledgeView } from './KnowledgeView';
import { TeacherVoiceConfigView } from './TeacherVoiceConfigView';

interface AdminPanelProps {
  studentId: string;
}

type AdminSection = 'menu' | 'memory' | 'knowledge' | 'voice-config';

export const AdminPanel: React.FC<AdminPanelProps> = ({ studentId }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('menu');

  const sections = [
    { id: 'memory' as const, label: 'Memória do Aluno', desc: 'Contexto e histórico de conversas', icon: Database },
    { id: 'knowledge' as const, label: 'RAG & Curriculum', desc: 'Base de conhecimento e currículo BJJ', icon: BookOpen },
    { id: 'voice-config' as const, label: 'Config. Vozes', desc: 'Voice IDs dos professores (ElevenLabs)', icon: Mic },
  ];

  if (activeSection === 'menu') {
    return (
      <div className="p-4 space-y-2">
        {sections.map(sec => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all"
              style={{
                backgroundColor: 'var(--js-bg-card)',
                border: '1px solid var(--js-border)',
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                }}>
                  <Icon className="w-4 h-4" style={{ color: 'var(--js-accent-purple-light)' }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--js-text-primary)' }}>{sec.label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--js-text-muted)' }}>{sec.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--js-text-muted)' }} />
            </button>
          );
        })}

        {/* Voice IDs quick reference */}
        <div className="mt-4 p-3 rounded-xl text-xs space-y-1.5" style={{
          backgroundColor: 'rgba(245, 158, 11, 0.06)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
        }}>
          <p className="font-bold" style={{ color: 'var(--js-accent-amber)' }}>Voice IDs Cadastradas:</p>
          <p style={{ color: 'var(--js-text-secondary)' }}>
            <span className="font-mono">Marcos:</span> 4J31DrhygVjvFsoj7BsM
          </p>
          <p style={{ color: 'var(--js-text-secondary)' }}>
            <span className="font-mono">Carol:</span> KHmfNHtEjHhLK9eER20w
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => setActiveSection('menu')}
        className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold w-full"
        style={{
          color: 'var(--js-accent-amber)',
          borderBottom: '1px solid var(--js-border)',
        }}
      >
        <span>←</span>
        <span>Voltar ao menu</span>
      </button>

      {activeSection === 'memory' && <MemoryView studentId={studentId} />}
      {activeSection === 'knowledge' && <KnowledgeView />}
      {activeSection === 'voice-config' && <TeacherVoiceConfigView />}
    </div>
  );
};
