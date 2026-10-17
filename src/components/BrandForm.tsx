import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  Sliders,
  Send,
} from 'lucide-react';
import { GenerateRequest, CampaignObjective } from '../types';

interface BrandFormProps {
  initialData: GenerateRequest;
  isLoading: boolean;
  onSubmit: (formData: GenerateRequest) => void;
}

const CAMPAIGN_OBJECTIVES: { value: CampaignObjective; label: string; desc: string }[] = [
  { value: 'Engagement', label: 'Engagement', desc: 'Boost replies, retweets, and discussions' },
  { value: 'Product Promotion', label: 'Product Promotion', desc: 'Highlight product features and value' },
  { value: 'Brand Awareness', label: 'Brand Awareness', desc: 'Introduce brand story, identity, and mission' },
  { value: 'Education', label: 'Education', desc: 'Share insights, tips, and problem-solving value' },
  { value: 'Product Launch', label: 'Product Launch', desc: 'Generate buzz and excitement for a new release' },
  { value: 'Website Traffic', label: 'Website Traffic', desc: 'Drive clicks and organic link visits' },
  { value: 'Community Building', label: 'Community Building', desc: 'Foster audience belonging and peer dialogue' },
];

const AVAILABLE_TONES = [
  'Professional',
  'Friendly',
  'Humorous',
  'Witty',
  'Premium',
  'Bold',
  'Informative',
  'Minimal',
  'Inspirational',
  'Conversational',
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Italian',
  'Japanese',
  'Hindi',
];

const CHAR_LIMIT_OPTIONS = [280, 240, 200, 140];

export const BrandForm: React.FC<BrandFormProps> = ({
  initialData,
  isLoading,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<GenerateRequest>(initialData);
  const [keywordInput, setKeywordInput] = useState('');
  const [avoidWordInput, setAvoidWordInput] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSamples, setShowSamples] = useState(initialData.sample_posts.length > 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync when initialData changes (e.g. from preset)
  React.useEffect(() => {
    setFormData(initialData);
    setShowSamples(initialData.sample_posts.length > 0);
    setErrors({});
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.campaign_objective?.trim()) {
      newErrors.campaign_objective = 'Please select a campaign objective.';
    }

    if (!formData.product_description?.trim()) {
      newErrors.product_description = 'Product or service description is required.';
    } else if (formData.product_description.trim().length < 5) {
      newErrors.product_description = 'Description must be at least 5 characters.';
    } else if (formData.product_description.length > 2000) {
      newErrors.product_description = 'Description cannot exceed 2000 characters.';
    }

    if (formData.brand_name && formData.brand_name.length > 100) {
      newErrors.brand_name = 'Brand name cannot exceed 100 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (validate()) {
      onSubmit({
        ...formData,
        campaign_objective: formData.campaign_objective.trim(),
        product_description: formData.product_description.trim(),
        brand_name: formData.brand_name?.trim() || undefined,
        industry: formData.industry?.trim() || undefined,
        target_audience: formData.target_audience?.trim() || undefined,
        additional_instructions: formData.additional_instructions?.trim() || undefined,
      });
    }
  };

  const toggleTone = (tone: string) => {
    setFormData((prev) => {
      const exists = prev.preferred_tone.includes(tone);
      const updated = exists
        ? prev.preferred_tone.filter((t) => t !== tone)
        : [...prev.preferred_tone, tone];
      return { ...prev, preferred_tone: updated };
    });
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !formData.keywords.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, keywords: [...prev.keywords, trimmed] }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== kw),
    }));
  };

  const addAvoidWord = () => {
    const trimmed = avoidWordInput.trim();
    if (trimmed && !formData.avoid_words.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, avoid_words: [...prev.avoid_words, trimmed] }));
      setAvoidWordInput('');
    }
  };

  const removeAvoidWord = (aw: string) => {
    setFormData((prev) => ({
      ...prev,
      avoid_words: prev.avoid_words.filter((w) => w !== aw),
    }));
  };

  const addSamplePost = () => {
    const trimmed = sampleInput.trim();
    if (trimmed && formData.sample_posts.length < 5) {
      setFormData((prev) => ({
        ...prev,
        sample_posts: [...prev.sample_posts, trimmed],
      }));
      setSampleInput('');
    }
  };

  const removeSamplePost = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sample_posts: prev.sample_posts.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl shadow-slate-950/50 space-y-6"
    >
      <div className="border-b border-slate-800/80 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Brand & Campaign Setup</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Provide your brand context. Our AI infers voice tone, audience triggers, and crafts 10 category-balanced tweets.
        </p>
      </div>

      {/* Row 1: Brand Name & Industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Brand Name <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.brand_name || ''}
            onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
            placeholder="e.g. TerraBrew, VoxelCloud, Acme Inc."
            maxLength={100}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
          />
          {errors.brand_name && (
            <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.brand_name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Industry / Category <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.industry || ''}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="e.g. Technology, Education, Fashion, Food, Fitness"
            maxLength={100}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Campaign Objective (Required) */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Campaign Objective <span className="text-rose-400 font-bold">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {CAMPAIGN_OBJECTIVES.map((obj) => {
            const isSelected = formData.campaign_objective === obj.value;
            return (
              <button
                type="button"
                key={obj.value}
                onClick={() => {
                  setFormData({ ...formData, campaign_objective: obj.value });
                  if (errors.campaign_objective) {
                    setErrors((prev) => ({ ...prev, campaign_objective: '' }));
                  }
                }}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="font-semibold">{obj.label}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{obj.desc}</div>
              </button>
            );
          })}
        </div>
        {errors.campaign_objective && (
          <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.campaign_objective}
          </p>
        )}
      </div>

      {/* Product or Service Description (Required) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Product or Service Description <span className="text-rose-400 font-bold">*</span>
          </label>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {formData.product_description.length} / 2000
          </span>
        </div>
        <textarea
          rows={3}
          value={formData.product_description}
          onChange={(e) => {
            setFormData({ ...formData, product_description: e.target.value });
            if (errors.product_description) {
              setErrors((prev) => ({ ...prev, product_description: '' }));
            }
          }}
          placeholder="Describe your core product or service, its key benefits, and why customers love it..."
          maxLength={2000}
          className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
            errors.product_description
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
          }`}
        />
        {errors.product_description && (
          <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.product_description}
          </p>
        )}
      </div>

      {/* Target Audience & Language */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Target Audience <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.target_audience || ''}
            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
            placeholder="e.g. Gen-Z coffee lovers, Enterprise CTOs, CrossFit athletes"
            maxLength={300}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preferred Tones (Multi-select) */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Preferred Tones <span className="text-slate-500 font-normal">(select one or more)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_TONES.map((tone) => {
            const isSelected = formData.preferred_tone.includes(tone);
            return (
              <button
                type="button"
                key={tone}
                onClick={() => toggleTone(tone)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {tone}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Advanced Options (Keywords, Avoid Topics, Character Limit, Additional Instructions) */}
      <div className="border-t border-slate-800/80 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Advanced Controls (Keywords, Exclusions, Max Length)</span>
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pt-2">
            {/* Keywords to Include */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Keywords to Weave In
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Type keyword and press Enter..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-cyan-300"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Words to Avoid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Words or Topics to Strictly Avoid
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={avoidWordInput}
                  onChange={(e) => setAvoidWordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAvoidWord();
                    }
                  }}
                  placeholder="e.g. cheap, guarantee, competitor names..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={addAvoidWord}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.avoid_words.map((aw) => (
                  <span
                    key={aw}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-rose-300"
                  >
                    <span>{aw}</span>
                    <button
                      type="button"
                      onClick={() => removeAvoidWord(aw)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Max Character Limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Character Limit per Tweet
              </label>
              <div className="flex gap-2">
                {CHAR_LIMIT_OPTIONS.map((limit) => (
                  <button
                    type="button"
                    key={limit}
                    onClick={() => setFormData({ ...formData, max_character_limit: limit })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums transition-colors ${
                      formData.max_character_limit === limit
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {limit} chars
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Prompt Instructions <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={formData.additional_instructions || ''}
                onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
                placeholder="Any special nuance, specific CTA formatting, or campaign themes..."
                maxLength={1000}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expandable Brand Samples (Section 4 requirement) */}
      <div className="border-t border-slate-800/80 pt-4">
        <button
          type="button"
          onClick={() => setShowSamples(!showSamples)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Brand Sample Posts <span className="text-slate-500 font-normal">(optional, improves voice matching)</span>
            </span>
          </span>
          {showSamples ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showSamples && (
          <div className="mt-3 space-y-3">
            <p className="text-[11px] text-slate-400">
              Paste up to 5 real posts previously published by your brand. The AI analyzes their rhythm and tone without copying them verbatim.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSamplePost();
                  }
                }}
                disabled={formData.sample_posts.length >= 5}
                placeholder={
                  formData.sample_posts.length >= 5
                    ? 'Maximum 5 sample posts reached'
                    : 'Paste a sample brand post...'
                }
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addSamplePost}
                disabled={!sampleInput.trim() || formData.sample_posts.length >= 5}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                Add Sample
              </button>
            </div>

            {formData.sample_posts.length > 0 && (
              <div className="space-y-1.5">
                {formData.sample_posts.map((post, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 p-2 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs text-slate-300"
                  >
                    <span className="font-mono text-cyan-400 shrink-0">#{idx + 1}</span>
                    <span className="flex-1 italic">{post}</span>
                    <button
                      type="button"
                      onClick={() => removeSamplePost(idx)}
                      className="text-slate-500 hover:text-rose-400 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Brand Voice & Generating 10 Tweets...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate 10 Tweets</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
