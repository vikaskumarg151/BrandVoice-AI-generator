import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BrandForm } from './components/BrandForm';
import { TweetResults } from './components/TweetResults';
import { LoadingState } from './components/LoadingState';
import { ErrorMessage } from './components/ErrorMessage';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DemoBadge } from './components/DemoBadge';
import {
  GenerateRequest,
  GenerateResponse,
  HistoryItem,
  HealthStatus,
  TweetItem,
} from './types';
import { BRAND_PRESETS } from './utils/presets';
import {
  loadHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
} from './utils/history';
import { Sparkles, Play, ShieldAlert, Cpu } from 'lucide-react';

function generateClientMockFallback(req: GenerateRequest): GenerateResponse {
  const brand = req.brand_name?.trim() || 'Brand';
  const tones = req.preferred_tone?.length ? req.preferred_tone.join(', ') : 'authentic & strategic';
  const objective = req.campaign_objective || 'Engagement';
  const product = (req.product_description || 'innovative product').trim();
  const audience = req.target_audience?.trim() || 'modern digital audience';
  const kw = req.keywords?.[0] || 'efficiency';

  const summary = [
    `Tone & Personality: ${tones.charAt(0).toUpperCase() + tones.slice(1)}, balancing professional authority with approachable energy.`,
    `Target Audience: Primarily ${audience}, seeking practical transformation and high-trust solutions.`,
    `Core Themes: Emphasizing ${objective.toLowerCase()}, overcoming friction in ${product.slice(0, 45)}..., and actionable community dialogue.`,
    `Messaging Style: Direct, fluff-free hooks paired with engaging conversational calls to action.`
  ];

  const tweets = [
    {
      id: 1,
      category: 'Conversational',
      text: `Most people think ${product.slice(0, 35)} has to be complicated. What if the simpler path actually gave you better results?`,
    },
    {
      id: 2,
      category: 'Conversational',
      text: `The best brand moments don't feel like marketing. They feel like a candid conversation with someone who gets it. Who's with us?`,
    },
    {
      id: 3,
      category: 'Promotional',
      text: `Built for ${audience}: our latest approach to ${product.slice(0, 40)} helps you drive real ${objective.toLowerCase()} without the headache.`,
    },
    {
      id: 4,
      category: 'Promotional',
      text: `Ready to elevate your everyday workflow? Discover how ${brand} helps you achieve ${kw} with fewer steps and greater impact.`,
    },
    {
      id: 5,
      category: 'Witty',
      text: `Your competitors are still sending 40-slide decks. Meanwhile, you're using ${brand} to get straight to the point.`,
    },
    {
      id: 6,
      category: 'Witty',
      text: `Coffee: consumed. Distractions: silenced. Unlocking true ${kw}: in progress. Just another day in our universe.`,
    },
    {
      id: 7,
      category: 'Informative',
      text: `Quick strategy tip: When targeting ${objective.toLowerCase()}, focus on clarifying one high-value outcome before expanding your scope. Less noise, more traction.`,
    },
    {
      id: 8,
      category: 'Informative',
      text: `Did you know? Clear, consistent brand messaging outperforms fragmented hype by over 3x in sustained recall. Clarity is your ultimate growth lever.`,
    },
    {
      id: 9,
      category: 'Community',
      text: `Question for our community: What is the single biggest bottleneck you face right now with ${product.slice(0, 30)}? Drop your thoughts below 👇`,
    },
    {
      id: 10,
      category: 'Community',
      text: `To everyone building something meaningful this week: what win are you most proud of? Let's celebrate each other in the replies.`,
    }
  ].map((t) => ({ ...t, character_count: t.text.length }));

  return {
    brand_name: brand,
    brand_voice_summary: summary,
    tweets,
    is_demo_mode: true,
  };
}

export default function App() {
  const [formData, setFormData] = useState<GenerateRequest>(BRAND_PRESETS[0].data);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forceDemoMode, setForceDemoMode] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDemoHelpOpen, setIsDemoHelpOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // Load history and verify health on initial mount
  useEffect(() => {
    setHistory(loadHistory());
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: HealthStatus = await res.json();
        setHealth(data);
        if (!data.openai_configured) {
          setForceDemoMode(true);
        }
      }
    } catch (err) {
      console.warn('Backend health check delayed or unavailable:', err);
    }
  };

  const handleGenerate = async (requestPayload: GenerateRequest, overrideForceDemo?: boolean) => {
    setIsLoading(true);
    setError(null);

    const useDemo = overrideForceDemo !== undefined ? overrideForceDemo : forceDemoMode;
    const payload = { ...requestPayload, force_demo: useDemo };

    try {
      let data: GenerateResponse | null = null;

      try {
        let response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // If 401 Unauthorized occurs, gracefully fallback to Demo Mode
        if (response.status === 401) {
          console.warn('401 from API. Retrying in Demo Mode...');
          setForceDemoMode(true);
          response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, force_demo: true }),
          });
        }

        if (response.ok) {
          data = await response.json();
        } else if (response.status === 401) {
          // If still 401, fallback client-side directly
          data = generateClientMockFallback(payload);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
              `Server returned status ${response.status}: Failed to generate tweets.`
          );
        }
      } catch (networkOrAuthErr: any) {
        // If it was a 401 or network failure, use client simulation directly
        console.warn('Fallback generator activated due to:', networkOrAuthErr);
        data = generateClientMockFallback(payload);
      }

      if (!data) {
        data = generateClientMockFallback(payload);
      }

      // Frontend validation check
      if (
        !data.brand_voice_summary ||
        data.brand_voice_summary.length !== 4 ||
        !Array.isArray(data.tweets) ||
        data.tweets.length !== 10
      ) {
        throw new Error(
          'Received unexpected format from generation engine. Please retry.'
        );
      }

      setResult(data);
      // Persist to local history
      const updatedHistory = saveHistoryItem(data, payload);
      setHistory(updatedHistory);

      // Smooth scroll down to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSingleTweet = async (tweetId: number) => {
    if (!result) return;
    setRegeneratingId(tweetId);

    try {
      const response = await fetch('/api/regenerate-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_info: formData,
          existing_tweets: result.tweets,
          tweet_id: tweetId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tweet && data.tweet.text) {
          setResult((prev) => {
            if (!prev) return null;
            const updatedTweets = prev.tweets.map((t) =>
              t.id === tweetId ? data.tweet : t
            );
            return { ...prev, tweets: updatedTweets };
          });
          return;
        }
      }

      // Fallback single tweet regeneration
      const currentCat = result.tweets.find(t => t.id === tweetId)?.category || 'Conversational';
      const fallbackTexts: Record<string, string> = {
        Conversational: `Here is a fresh take: sometimes the most impactful brand shift is simplifying your message. What resonates most with your routine?`,
        Promotional: `Built for performance and reliability. Experience how ${formData.brand_name || 'our platform'} elevates your daily results.`,
        Witty: `Your competitors are still doing this manually. Meanwhile, you're 3 steps ahead and already having lunch.`,
        Informative: `Pro insight: Consistency in messaging compounds recall over 3x faster than high-frequency random posts.`,
        Community: `To our community: what is the one question you wish more brands in this space asked? Let's discuss 👇`
      };
      const text = fallbackTexts[currentCat] || `Fresh perspective from ${formData.brand_name || 'Brand'}. What do you think?`;
      
      setResult((prev) => {
        if (!prev) return null;
        const updatedTweets = prev.tweets.map((t) =>
          t.id === tweetId ? { ...t, text, character_count: text.length } : t
        );
        return { ...prev, tweets: updatedTweets };
      });
    } catch (err: any) {
      console.error('Single tweet regeneration error:', err);
      setError('Could not regenerate this tweet right now. Please try again.');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleUpdateTweetText = (id: number, newText: string) => {
    if (!result) return;
    setResult((prev) => {
      if (!prev) return null;
      const updated = prev.tweets.map((t) =>
        t.id === id ? { ...t, text: newText, character_count: newText.length } : t
      );
      return { ...prev, tweets: updated };
    });
  };

  const handleSelectPreset = (presetData: GenerateRequest) => {
    setFormData(presetData);
    setError(null);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setFormData(item.request_payload);
    setResult({
      brand_name: item.brand_name,
      brand_voice_summary: item.brand_voice_summary,
      tweets: item.tweets,
      is_demo_mode: item.is_demo_mode,
    });
    setError(null);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  const handleNewGeneration = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDemo = result ? result.is_demo_mode : forceDemoMode;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        onSelectPreset={handleSelectPreset}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onNewGeneration={handleNewGeneration}
        isDemoMode={isDemo}
        onToggleDemoHelp={() => setIsDemoHelpOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Brand Voice Analysis & 10 Categorized Tweets</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight font-display">
            Turn Your Brand Voice Into{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              High-Impact Tweets
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Generate 10 original, category-balanced tweets across Conversational, Promotional, Witty, Informative, and Community angles based on a 4-pillar brand voice analysis.
          </p>

          {/* Mode Switch Pills */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setForceDemoMode(true)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                forceDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Demo Simulation Mode (Instant, No Key)
            </button>
            <button
              type="button"
              onClick={() => {
                setForceDemoMode(false);
                setIsDemoHelpOpen(true);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                !forceDemoMode
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Live OpenAI Mode
            </button>
          </div>
        </div>

        {/* Error Notification if any */}
        {error && (
          <div className="max-w-4xl mx-auto">
            <ErrorMessage
              message={error}
              onRetry={() => handleGenerate(formData)}
              onDismiss={() => setError(null)}
              onUseDemoMode={() => handleGenerate(formData, true)}
            />
          </div>
        )}

        {/* Input Form Section */}
        <div className="max-w-4xl mx-auto">
          <BrandForm
            initialData={formData}
            isLoading={isLoading}
            onSubmit={(payload) => handleGenerate(payload)}
          />
        </div>

        {/* Loading State Spinner */}
        {isLoading && <LoadingState />}

        {/* Results Section */}
        {result && !isLoading && (
          <div id="results-section" className="scroll-mt-24 pt-4">
            <TweetResults
              result={result}
              maxCharLimit={formData.max_character_limit}
              objective={formData.campaign_objective}
              onUpdateTweetText={handleUpdateTweetText}
              onRegenerateSingleTweet={handleRegenerateSingleTweet}
              onGenerateAgain={() => handleGenerate(formData)}
              regeneratingId={regeneratingId}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>BrandVoice AI · Intelligent Social Content Architecture</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>FastAPI & Python 3</span>
            <span aria-hidden="true">·</span>
            <span>React & Vite</span>
            <span aria-hidden="true">·</span>
            <span>OpenAI API Compatible</span>
          </div>
        </div>
      </footer>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
      />

      {/* Demo Mode Information Modal */}
      <DemoBadge
        isOpen={isDemoHelpOpen}
        onClose={() => setIsDemoHelpOpen(false)}
        isConfigured={health?.openai_configured || false}
      />

    </div>
  );
}
