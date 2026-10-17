import React, { useState } from 'react';
import { Info, Key, X, CheckCircle2 } from 'lucide-react';

interface DemoBadgeProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  isOpen,
  onClose,
  isConfigured,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isConfigured ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
            }`}>
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isConfigured ? 'OpenAI Engine Active' : 'BrandVoice AI Demo Simulator'}
              </h3>
              <p className="text-xs text-slate-400">
                {isConfigured ? 'Running live requests via OpenAI API' : 'Running tailored simulation with intelligent inference'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          {isConfigured ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Your OPENAI_API_KEY is detected & operational.</span>
              </div>
              <p className="text-slate-400">
                All brand voice inferences and 10-tweet generation batches are processed directly through your configured OpenAI model.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-amber-300 font-medium">
                Notice: No active OpenAI API key was detected in the environment.
              </p>
              <p className="text-slate-400">
                BrandVoice AI is currently running in <strong className="text-white">Demo Mode</strong>. It crafts authentic brand voice analyses and 10 category-balanced tweets using dynamic algorithms matching your specific brand, tone, and campaign inputs.
              </p>
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-200">To enable live OpenAI generation:</span>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Get an API key from <code className="text-cyan-300 font-mono">platform.openai.com</code>.</li>
                  <li>Add <code className="text-cyan-300 font-mono">OPENAI_API_KEY="sk-..."</code> into your local <code className="text-cyan-300 font-mono">.env</code> file.</li>
                  <li>Restart the backend or development server.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
