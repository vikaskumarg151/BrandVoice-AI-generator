import { GenerateResponse } from '../types';

export function exportTweetsToTxt(result: GenerateResponse, objective?: string): void {
  const brand = result.brand_name || 'Brand';
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const lines: string[] = [];
  lines.push('=====================================================');
  lines.push(` BRANDVOICE AI - 10 TWEET CAMPAIGN ARCHIVE`);
  lines.push('=====================================================');
  lines.push(`Brand Name:        ${brand}`);
  if (objective) {
    lines.push(`Campaign Goal:     ${objective}`);
  }
  lines.push(`Exported On:       ${timestamp}`);
  lines.push(`Generation Mode:   ${result.is_demo_mode ? 'Demo / Local Simulation' : 'Live OpenAI Production'}`);
  lines.push('');
  lines.push('-----------------------------------------------------');
  lines.push(' BRAND VOICE ANALYSIS (4 CORE PILLARS)');
  lines.push('-----------------------------------------------------');
  result.brand_voice_summary.forEach((bullet, idx) => {
    lines.push(`[${idx + 1}] ${bullet}`);
  });
  lines.push('');
  lines.push('-----------------------------------------------------');
  lines.push(' GENERATED 10 TWEETS BY CATEGORY');
  lines.push('-----------------------------------------------------');

  result.tweets.forEach((tweet) => {
    lines.push('');
    lines.push(`[TWEET #${tweet.id.toString().padStart(2, '0')}] Category: ${tweet.category.toUpperCase()}`);
    lines.push(`Character Count: ${tweet.text.length} chars`);
    lines.push('-----------------------------------------------------');
    lines.push(tweet.text);
    lines.push('');
  });

  lines.push('=====================================================');
  lines.push(' End of BrandVoice AI Export');
  lines.push('=====================================================');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `${safeBrand}_tweets_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
