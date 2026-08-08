import React, { useState, useEffect } from 'react';
import { ChatView } from './components/ChatView';
import { AdminPanel } from './components/AdminPanel';
import { Shield, X } from 'lucide-react';

export default function App() {
  // Admin ONLY via URL param ?admin=true — students never see anything
  const [isAdmin] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('admin') === 'true';
  });
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const studentId = 'std-carlos-123';

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{
      backgroundColor: 'var(--js-bg-primary)',
      color: 'var(--js-text-primary)',
    }}>
      {/* Minimal Header — clean for students */}
      <header className="flex-none pt-safe z-40 flex items-center justify-between px-3 sm:px-6 h-12 sm:h-14" style={{
        backgroundColor: 'var(--js-bg-secondary)',
        borderBottom: '1px solid var(--js-border)',
      }}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9, #f59e0b)',
              boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
            }}>JS</div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight">
            JIUSPEAK <span style={{ color: 'var(--js-accent-amber)' }}>AI</span>
          </h1>
        </div>

        {/* Admin button — ONLY if ?admin=true in URL */}
        {isAdmin && (
          <button onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="flex items-center space-x-1 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{
              backgroundColor: showAdminPanel ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.12)',
              color: 'var(--js-accent-amber)',
              border: '1px solid rgba(245,158,11,0.25)',
            }}>
            <Shield className="w-3 h-3" />
            <span>ADMIN</span>
          </button>
        )}
      </header>

      {/* Full-screen Chat + Avatar */}
      <main className="flex-1 min-h-0">
        <ChatView studentId={studentId} />
      </main>

      {/* Admin Slide-Over Panel — only if admin */}
      {isAdmin && showAdminPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdminPanel(false)} />
          <div className="relative ml-auto w-full max-w-lg h-full overflow-y-auto" style={{
            backgroundColor: 'var(--js-bg-secondary)',
            borderLeft: '1px solid var(--js-border)',
          }}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3" style={{
              backgroundColor: 'var(--js-bg-secondary)',
              borderBottom: '1px solid var(--js-border)',
            }}>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" style={{ color: 'var(--js-accent-amber)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--js-accent-amber)' }}>Painel Admin</span>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className="p-2 rounded-lg" style={{ color: 'var(--js-text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminPanel studentId={studentId} />
          </div>
        </div>
      )}
    </div>
  );
}
