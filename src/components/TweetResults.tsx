import React, { useState } from 'react';
import { Copy, Download, RefreshCw, Check, Sparkles, Filter } from 'lucide-react';
import { GenerateResponse, TweetCategory } from '../types';
import { TweetCard } from './TweetCard';
import { VoiceSummary } from './VoiceSummary';
import { copyToClipboard } from '../utils/clipboard';
import { exportTweetsToTxt } from '../utils/export';

interface TweetResultsProps {
  result: GenerateResponse;
  maxCharLimit: number;
  objective?: string;
  onUpdateTweetText: (id: number, text: string) => void;
  onRegenerateSingleTweet: (id: number) => Promise<void>;
  onGenerateAgain: () => void;
  regeneratingId: number | null;
}

export const TweetResults: React.FC<TweetResultsProps> = ({
  result,
  maxCharLimit,
  objective,
  onUpdateTweetText,
  onRegenerateSingleTweet,
  onGenerateAgain,
  regeneratingId,
}) => {
  const [copyAllSuccess, setCopyAllSuccess] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const handleCopyAll = async () => {
    const textBlocks = result.tweets.map(
      (t, idx) => `[${idx + 1}. ${t.category.toUpperCase()}]\n${t.text}\n`
    );
    const fullText = `--- ${result.brand_name || 'Brand'} Tweets (${result.tweets.length} Generated) ---\n\n` + textBlocks.join('\n');
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopyAllSuccess(true);
      setTimeout(() => setCopyAllSuccess(false), 2500);
    }
  };

  const handleExport = () => {
    exportTweetsToTxt(result, objective);
  };

  const categories = ['All', 'Conversational', 'Promotional', 'Witty', 'Informative', 'Community'];

  const filteredTweets = activeFilter === 'All'
    ? result.tweets
    : result.tweets.filter((t) => t.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Brand Voice Summary Dimension */}
      <VoiceSummary
        brandName={result.brand_name}
        summaryBullets={result.brand_voice_summary}
        isDemoMode={result.is_demo_mode}
      />

      {/* Control Bar: Filters & Batch Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: Interactive Category Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const count = cat === 'All' ? result.tweets.length : result.tweets.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length;
            const isActive = activeFilter === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] font-mono tabular-nums ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Global Actions (Copy All, Export TXT, Generate Again) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAll}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              copyAllSuccess
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80'
            }`}
          >
            {copyAllSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied All 10</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy All 10</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
            title="Download formatted text document"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export TXT</span>
          </button>

          <button
            type="button"
            onClick={onGenerateAgain}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Again</span>
          </button>
        </div>

      </div>

      {/* Grid of 10 Tweet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {filteredTweets.map((tweet) => (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            maxCharLimit={maxCharLimit}
            onUpdateText={onUpdateTweetText}
            onRegenerate={onRegenerateSingleTweet}
            isRegenerating={regeneratingId === tweet.id}
          />
        ))}
      </div>

    </div>
  );
};
