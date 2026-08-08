import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { StudentProfileView } from './components/StudentProfileView';
import { MemoryView } from './components/MemoryView';
import { KnowledgeView } from './components/KnowledgeView';
import { ExerciseView } from './components/ExerciseView';
import { TeacherVoiceConfigView } from './components/TeacherVoiceConfigView';
import { ApiDocsModal } from './components/ApiDocsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isApiDocsOpen, setIsApiDocsOpen] = useState<boolean>(false);
  const studentId = 'std-carlos-123';

  return (
    <div id="jiuspeak-app-root" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
      />

      {/* Main Tab View Router */}
      <main className="pb-12">
        {activeTab === 'chat' && <ChatView studentId={studentId} />}
        {activeTab === 'profile' && <StudentProfileView studentId={studentId} />}
        {activeTab === 'memory' && <MemoryView studentId={studentId} />}
        {activeTab === 'knowledge' && <KnowledgeView />}
        {activeTab === 'exercise' && <ExerciseView />}
        {activeTab === 'voice-config' && <TeacherVoiceConfigView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>🥋 JiuSpeak AI Platform • Arquitetura Limpa & Inteligência Pedagógica de BJJ</p>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsApiDocsOpen(true)} className="hover:text-amber-400 underline">
              OpenAPI Swagger
            </button>
            <span>•</span>
            <span className="text-slate-400">Gemini 2.5 Flash & ElevenLabs HD</span>
          </div>
        </div>
      </footer>

      {/* Swagger Modal */}
      <ApiDocsModal isOpen={isApiDocsOpen} onClose={() => setIsApiDocsOpen(false)} />
    </div>
  );
}
