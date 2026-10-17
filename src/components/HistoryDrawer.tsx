import React from 'react';
import { X, Trash2, Clock, ArrowRight, Sparkles, FolderOpen } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Generation History</h3>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              ({history.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors"
                title="Clear all stored generations"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <FolderOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-400">No saved generations yet</p>
              <p className="text-xs text-slate-500">
                Generated tweet collections will appear here automatically for fast retrieval and reuse.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.brand_name || 'Brand Campaign'}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {item.formatted_date} · {item.campaign_objective}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors"
                    title="Delete this entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 italic">
                  "{item.tweets[0]?.text || 'Campaign tweets'}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <span className="text-[11px] text-slate-500">
                    {item.tweets.length} tweets · 4 voice pillars
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Restore</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Saved locally in browser storage (no API keys stored).
        </div>

      </div>
    </div>
  );
};
