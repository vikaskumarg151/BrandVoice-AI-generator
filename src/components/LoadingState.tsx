import React from 'react';
import { Sparkles, MessageCircle, Cpu, CheckCircle2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl shadow-slate-950/60 text-center space-y-6 max-w-xl mx-auto my-8">
      {/* Animated Spinner with Glowing Accents */}
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-slate-800 border-t-cyan-400 border-r-blue-500 animate-spin" />
        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Generating 10 Brand Tweets
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          The engine is analyzing your brand positioning, evaluating audience resonance, and formulating tweets across conversational, promotional, witty, informative, and community angles.
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="space-y-2 max-w-sm mx-auto text-left pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Processing brand objective & description</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Synthesizing 4-pillar brand voice analysis</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          <span>Balancing 5 required tweet categories</span>
        </div>
      </div>
    </div>
  );
};
