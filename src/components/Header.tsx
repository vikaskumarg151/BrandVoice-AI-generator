import React from 'react';
import { Sparkles, History, RotateCcw, HelpCircle, Layers } from 'lucide-react';
import { BRAND_PRESETS, BrandPreset } from '../utils/presets';
import { GenerateRequest } from '../types';

interface HeaderProps {
  onSelectPreset: (presetData: GenerateRequest) => void;
  onOpenHistory: () => void;
  historyCount: number;
  onNewGeneration: () => void;
  isDemoMode: boolean;
  onToggleDemoHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  onOpenHistory,
  historyCount,
  onNewGeneration,
  isDemoMode,
  onToggleDemoHelp,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark (Single text element with icon mark) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
              BrandVoice <span className="text-cyan-400">AI</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links, Presets & Demo Status */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-300">
          {/* Quick Presets Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
              title="Load industry preset example"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Brand Preset</span>
            </button>
            <div className="absolute left-0 top-full mt-1.5 w-60 py-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-black/50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Explore Diverse Brands
              </div>
              {BRAND_PRESETS.map((preset: BrandPreset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.data)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-cyan-300 transition-colors flex flex-col"
                >
                  <span className="font-medium text-white">{preset.name}</span>
                  <span className="text-[11px] text-slate-400">{preset.industry}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Indicator */}
          <button
            onClick={onToggleDemoHelp}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              isDemoMode
                ? 'bg-amber-950/30 border-amber-800/50 text-amber-300 hover:bg-amber-900/30'
                : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span>{isDemoMode ? 'Demo Simulator' : 'OpenAI Production'}</span>
            <HelpCircle className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Zone 3: Primary Action & History */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="View recent tweet generations"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded text-[10px] font-mono tabular-nums">
                {historyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onNewGeneration}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-lg shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Generation</span>
          </button>
        </div>

      </div>
    </header>
  );
};
