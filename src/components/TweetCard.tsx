import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Edit2, Save, X } from 'lucide-react';
import { TweetItem } from '../types';
import { copyToClipboard } from '../utils/clipboard';

interface TweetCardProps {
  tweet: TweetItem;
  maxCharLimit: number;
  onUpdateText: (id: number, newText: string) => void;
  onRegenerate: (id: number) => Promise<void>;
  isRegenerating: boolean;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  maxCharLimit,
  onUpdateText,
  onRegenerate,
  isRegenerating,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.text);

  const charCount = isEditing ? editText.length : tweet.text.length;
  const isOverLimit = charCount > maxCharLimit;

  const handleCopy = async () => {
    const success = await copyToClipboard(tweet.text);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdateText(tweet.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(tweet.text);
    setIsEditing(false);
  };

  // Subtle category styling
  const categoryColors: Record<string, { text: string; bg: string }> = {
    Conversational: { text: 'text-sky-300', bg: 'bg-sky-950/40 border-sky-800/50' },
    Promotional: { text: 'text-indigo-300', bg: 'bg-indigo-950/40 border-indigo-800/50' },
    Witty: { text: 'text-amber-300', bg: 'bg-amber-950/40 border-amber-800/50' },
    Informative: { text: 'text-emerald-300', bg: 'bg-emerald-950/40 border-emerald-800/50' },
    Community: { text: 'text-purple-300', bg: 'bg-purple-950/40 border-purple-800/50' },
  };

  const currentCategoryStyle = categoryColors[tweet.category] || {
    text: 'text-cyan-300',
    bg: 'bg-slate-900 border-slate-800',
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between transition-all duration-200 hover:shadow-cyan-950/20">
      
      {/* Top Header of Card: Category, ID, and Character Count */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
            #{tweet.id.toString().padStart(2, '0')}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${currentCategoryStyle.bg} ${currentCategoryStyle.text}`}
          >
            {tweet.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
          <span
            className={`${
              isOverLimit
                ? 'text-rose-400 font-bold'
                : charCount > maxCharLimit - 20
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          >
            {charCount}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-500">{maxCharLimit}</span>
        </div>
      </div>

      {/* Tweet Content Body */}
      <div className="flex-1 min-h-[90px]">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              rows={4}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-cyan-500/80 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none leading-relaxed resize-none"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!editText.trim()}
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
            {tweet.text}
          </p>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3.5 mt-3.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setEditText(tweet.text);
                setIsEditing(true);
              }}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 rounded-lg transition-colors flex items-center gap-1"
              title="Edit tweet text"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onRegenerate(tweet.id)}
            disabled={isRegenerating || isEditing}
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40"
            title="Regenerate only this tweet"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-cyan-400' : ''}`}
            />
            <span>{isRegenerating ? 'Drafting...' : 'Regenerate'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            isCopied
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
          }`}
          title="Copy tweet to clipboard"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
