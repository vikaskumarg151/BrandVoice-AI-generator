import React from 'react';
import { AlertTriangle, RefreshCw, X, Play } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  onUseDemoMode?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  onUseDemoMode,
}) => {
  const isAuthError =
    message.includes('401') ||
    message.toLowerCase().includes('unauthorized') ||
    message.toLowerCase().includes('api key');

  return (
    <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-5 shadow-xl shadow-rose-950/20 text-rose-200 space-y-3 animate-in fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-900/60 border border-rose-700/60 flex items-center justify-center shrink-0 text-rose-300 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {isAuthError ? 'OpenAI API Key Not Found or Invalid' : 'Generation Error'}
            </h4>
            <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
              {isAuthError
                ? 'An OpenAI API key is required for live generation. You can test the full functionality right now in Demo Simulator Mode without an API key.'
                : message}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-rose-900/50 text-xs">
        <span className="text-[11px] text-rose-300/70">
          {isAuthError
            ? 'Add OPENAI_API_KEY in .env or run in instant Demo Mode.'
            : 'Check your inputs, network connection, or try using an industry preset.'}
        </span>
        <div className="flex items-center gap-2">
          {onUseDemoMode && (
            <button
              type="button"
              onClick={onUseDemoMode}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Generate in Demo Mode</span>
            </button>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
