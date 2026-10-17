import React from 'react';
import { Target, MessageSquare, Zap, ShieldCheck } from 'lucide-react';

interface VoiceSummaryProps {
  brandName: string;
  summaryBullets: string[];
  isDemoMode?: boolean;
}

export const VoiceSummary: React.FC<VoiceSummaryProps> = ({
  brandName,
  summaryBullets,
  isDemoMode,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl shadow-slate-950/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4 mb-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
            Brand Intelligence Synthesis
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Voice Profile: <span className="text-cyan-300">{brandName || 'Brand Identity'}</span>
          </h2>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>4-Dimension Analysis</span>
        </div>
      </div>

      {/* 4 Brand Voice Analysis Bullets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaryBullets.map((bullet, idx) => {
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1.5 transition-colors hover:border-slate-700/80"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="font-mono text-cyan-400 tabular-nums">0{idx + 1}.</span>
                <span>
                  {idx === 0 && 'Tone & Personality'}
                  {idx === 1 && 'Audience & Motivation'}
                  {idx === 2 && 'Themes & Core Angles'}
                  {idx === 3 && 'Style & Engagement Rules'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                {bullet}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
        <span>Strategic inference derived from campaign goals & audience alignment.</span>
        {isDemoMode && <span className="text-amber-400/80">Demo Simulation Output</span>}
      </div>
    </div>
  );
};
