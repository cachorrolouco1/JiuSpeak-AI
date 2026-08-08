import React, { useState } from 'react';
import { X, Terminal, Code, Copy, Check, Server } from 'lucide-react';
import { swaggerSpec } from '../server/swagger-doc';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(swaggerSpec, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">JiuSpeak AI - OpenAPI 3.0 / Swagger Specification</h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Swagger JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
            <p className="font-bold flex items-center space-x-1.5 mb-1">
              <Server className="w-4 h-4 text-amber-400" />
              <span>Gateway API Preparado para Integração no Site Principal do JiuSpeak</span>
            </p>
            <p className="text-slate-300">
              Esta especificação contém os contratos para os endpoints <code>/api/ai/chat</code>, <code>/api/ai/student/:id</code>, <code>/api/ai/student/:id/progress</code>, <code>/api/ai/evaluate</code>, <code>/api/ai/voice/tts</code> e <code>/api/ai/avatar/generate-video</code>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto max-h-[400px]">
            <pre>{jsonString}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
